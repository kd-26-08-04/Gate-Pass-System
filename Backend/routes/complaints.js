const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Create a new complaint (Student only)
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can create complaints' });
    }

    const { title, description, category, priority, relatedGatePass, openToAll } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Title, description, and category are required' 
      });
    }

    // Get student details
    const student = await User.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const complaint = new Complaint({
      student: req.user.userId,
      studentName: student.name,
      studentUSN: student.usn,
      department: student.department,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      relatedGatePass: relatedGatePass || null,
      openToAll: openToAll || false,
      requiresVoting: openToAll || false,
      votingEnabled: openToAll || false,
      votingDeadline: openToAll ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days from now if open to all
    });

    await complaint.save();

    // Create notification for HOD about new complaint
    const hod = await User.findOne({ 
      department: student.department, 
      userType: 'hod' 
    });
    
    if (hod) {
      await createNotification(
        'new_complaint',
        `New complaint submitted by ${student.name} (${student.usn}): ${title}`,
        hod._id,
        {
          id: complaint._id.toString(),
          title: title,
          status: 'pending'
        },
        priority === 'high' ? 'high' : 'normal'
      );
    }

    // If complaint is open to all students and voting enabled, notify all students and dean
    if (openToAll && complaint.votingEnabled) {
      // Get all students
      const students = await User.find({ userType: 'student' });
      
      // Get dean
      const dean = await User.findOne({ userType: 'dean' });
      
      // Create notifications for all students
      const studentNotifications = students.map(studentUser => ({
        type: 'complaint_voting_enabled',
        message: `New complaint open for voting: ${title}`,
        recipient: studentUser._id,
        actionData: {
          id: complaint._id.toString(),
          title: title,
          status: 'voting'
        },
        priority: 'normal'
      }));
      
      if (studentNotifications.length > 0) {
        await require('../models/Notification').insertMany(studentNotifications);
      }
      
      // Create notification for dean
      if (dean) {
        await createNotification(
          'complaint_voting_enabled',
          `New complaint open for voting: ${title}`,
          dean._id,
          {
            id: complaint._id.toString(),
            title: title,
            status: 'voting'
          },
          'normal'
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error while creating complaint' });
  }
});

// Get complaints for student
router.get('/my-complaints', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can view their complaints' });
    }

    const complaints = await Complaint.find({ student: req.user.userId })
      .populate('assignedTo', 'name')
      .populate('relatedGatePass', 'destination reason')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Get student complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
});

// Get all complaints for HOD
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can view all complaints' });
    }

    const hod = await User.findById(req.user.userId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    const complaints = await Complaint.find({ department: hod.department })
      .populate('student', 'name usn')
      .populate('assignedTo', 'name')
      .populate('relatedGatePass', 'destination reason')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
});

// Get pending complaints for HOD
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can view pending complaints' });
    }

    const hod = await User.findById(req.user.userId);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    const complaints = await Complaint.find({ 
      department: hod.department,
      status: { $in: ['pending', 'in_progress'] }
    })
      .populate('student', 'name usn')
      .populate('relatedGatePass', 'destination reason')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Get pending complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching pending complaints' });
  }
});

// Get complaint by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name usn email')
      .populate('assignedTo', 'name')
      .populate('relatedGatePass', 'destination reason exitTime');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user has permission to view this complaint
    if (req.user.userType === 'student' && complaint.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.userType === 'hod') {
      const hod = await User.findById(req.user.userId);
      if (complaint.department !== hod.department) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      complaint: complaint
    });

  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching complaint' });
  }
});

// Update complaint status (HOD only)
router.put('/update-status/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({ message: 'Only HODs can update complaint status' });
    }

    const { status, response } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if HOD has permission to update this complaint
    const hod = await User.findById(req.user.userId);
    if (complaint.department !== hod.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    if (response) {
      complaint.response = response;
      complaint.responseDate = new Date();
    }
    complaint.assignedTo = req.user.userId;

    await complaint.save();

    // Create notification for student about status update
    if (oldStatus !== status) {
      const notificationType = response ? 'complaint_response' : 'complaint_status_update';
      const message = response 
        ? `Your complaint "${complaint.title}" has received a response from ${hod.name}`
        : `Your complaint "${complaint.title}" status has been updated to ${status}`;
      
      await createNotification(
        notificationType,
        message,
        complaint.student,
        {
          id: complaint._id.toString(),
          title: complaint.title,
          status: status
        },
        'high'
      );
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error while updating complaint' });
  }
});

// Get complaint statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.userType === 'student') {
      filter.student = req.user.userId;
    } else if (req.user.userType === 'hod') {
      const hod = await User.findById(req.user.userId);
      filter.department = hod.department;
    }

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ message: 'Server error while fetching complaint stats' });
  }
});

module.exports = router;