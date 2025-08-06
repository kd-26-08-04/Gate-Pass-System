const express = require('express');
const GatePass = require('../models/GatePass');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cleanupService = require('../services/cleanupService');

const router = express.Router();

// Create gate pass (Student only)
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can create gate passes' });
    }

    const student = await User.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const {
      reason,
      destination,
      exitTime,
      expectedReturnTime,
      emergencyContact,
      parentContact
    } = req.body;

    // Validate dates
    const exit = new Date(exitTime);
    const expectedReturn = new Date(expectedReturnTime);
    const now = new Date();

    if (exit < now) {
      return res.status(400).json({ message: 'Exit time cannot be in the past' });
    }

    if (expectedReturn <= exit) {
      return res.status(400).json({ message: 'Expected return time must be after exit time' });
    }

    const gatePass = new GatePass({
      student: student._id,
      studentName: student.name,
      studentUSN: student.usn,
      department: student.department,
      reason,
      destination,
      exitTime: exit,
      expectedReturnTime: expectedReturn,
      emergencyContact,
      parentContact
    });

    await gatePass.save();

    res.status(201).json({
      message: 'Gate pass created successfully',
      gatePass
    });

  } catch (error) {
    console.error('Create gate pass error:', error);
    res.status(500).json({ message: 'Server error while creating gate pass' });
  }
});

// Get gate passes for student
router.get('/my-passes', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can view their gate passes' });
    }

    // Clean up old pending gate passes before fetching
    await GatePass.cleanupOldPendingPasses();

    const gatePasses = await GatePass.find({ student: req.user.userId })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      gatePasses: gatePasses
    });

  } catch (error) {
    console.error('Get student gate passes error:', error);
    res.status(500).json({ message: 'Server error while fetching gate passes' });
  }
});

// Get pending gate passes for HOD
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can view pending gate passes' });
    }

    const hod = await User.findById(req.user.userId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Clean up old pending gate passes before fetching
    await GatePass.cleanupOldPendingPasses();

    const pendingPasses = await GatePass.find({
      department: hod.department,
      status: 'pending'
    }).populate('student', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pendingPasses);

  } catch (error) {
    console.error('Get pending gate passes error:', error);
    res.status(500).json({ message: 'Server error while fetching pending gate passes' });
  }
});

// Get all gate passes for HOD (approved, rejected, etc.)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can view all gate passes' });
    }

    const hod = await User.findById(req.user.userId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { department: hod.department };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const gatePasses = await GatePass.find(query)
      .populate('student', 'name email phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GatePass.countDocuments(query);

    res.json({
      gatePasses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all gate passes error:', error);
    res.status(500).json({ message: 'Server error while fetching gate passes' });
  }
});

// Approve gate pass (HOD only)
router.put('/approve/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can approve gate passes' });
    }

    const hod = await User.findById(req.user.userId);
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (gatePass.department !== hod.department) {
      return res.status(403).json({ message: 'You can only approve gate passes from your department' });
    }

    if (gatePass.status !== 'pending') {
      return res.status(400).json({ message: 'Gate pass is not pending approval' });
    }

    gatePass.status = 'approved';
    gatePass.approvedBy = hod._id;
    gatePass.approvalDate = new Date();

    await gatePass.save();

    res.json({
      message: 'Gate pass approved successfully',
      gatePass
    });

  } catch (error) {
    console.error('Approve gate pass error:', error);
    res.status(500).json({ message: 'Server error while approving gate pass' });
  }
});

// Reject gate pass (HOD only)
router.put('/reject/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can reject gate passes' });
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const hod = await User.findById(req.user.userId);
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (gatePass.department !== hod.department) {
      return res.status(403).json({ message: 'You can only reject gate passes from your department' });
    }

    if (gatePass.status !== 'pending') {
      return res.status(400).json({ message: 'Gate pass is not pending approval' });
    }

    gatePass.status = 'rejected';
    gatePass.rejectionReason = rejectionReason;
    gatePass.approvedBy = hod._id;
    gatePass.approvalDate = new Date();

    await gatePass.save();

    res.json({
      message: 'Gate pass rejected successfully',
      gatePass
    });

  } catch (error) {
    console.error('Reject gate pass error:', error);
    res.status(500).json({ message: 'Server error while rejecting gate pass' });
  }
});

// Mark student as returned
router.put('/return/:id', auth, async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (gatePass.status !== 'approved') {
      return res.status(400).json({ message: 'Gate pass is not approved' });
    }

    if (gatePass.isReturned) {
      return res.status(400).json({ message: 'Student has already returned' });
    }

    gatePass.isReturned = true;
    gatePass.actualReturnTime = new Date();

    await gatePass.save();

    res.json({
      message: 'Student marked as returned successfully',
      gatePass
    });

  } catch (error) {
    console.error('Mark return error:', error);
    res.status(500).json({ message: 'Server error while marking return' });
  }
});

// Manual cleanup endpoint (for admin/testing purposes)
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Only allow HODs to trigger manual cleanup
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can trigger cleanup' });
    }

    const deletedCount = await GatePass.cleanupOldPendingPasses();
    
    res.json({
      success: true,
      message: `Cleanup completed successfully`,
      deletedCount: deletedCount
    });

  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ message: 'Server error during cleanup' });
  }
});

module.exports = router;