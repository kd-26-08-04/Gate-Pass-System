const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { createNotification } = require('./notifications');

// Get all complaints available for voting (Students: department-only, Dean: all)
router.get('/complaints', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student' && req.user.userType !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only students and dean can view voting complaints'
      });
    }

    const now = new Date();

    // Base query: voting must be enabled and not expired
    let query = {
      votingEnabled: true,
      votingDeadline: { $gt: now }
    };

    if (req.user.userType === 'student') {
      // Students see:
      // - College-scope complaints (any department)
      // - Department-scope complaints only from their department
      const student = await User.findById(req.user.userId).select('department');
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      query.$and = [
        {
          $or: [
            { votingScope: 'college' },
            { votingScope: 'department', department: student.department }
          ]
        },
        { 'votes.student': { $ne: req.user.userId } } // exclude already voted
      ];
    }

    // For dean, only show college-scope open votes
    if (req.user.userType === 'dean') {
      query.votingScope = 'college';
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name usn department')
      .sort({ createdAt: -1 });

    // Hide vote details and summary from non-dean users
    let data = complaints;
    if (req.user.userType !== 'dean') {
      data = complaints.map(c => {
        const obj = c.toObject();
        delete obj.votes;
        delete obj.votingSummary;
        return obj;
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching voting complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Submit a vote on a complaint
router.post('/complaints/:complaintId/vote', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student' && req.user.userType !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only students and dean can vote on complaints'
      });
    }

    const { complaintId } = req.params;
    const { vote, reason } = req.body;

    if (!vote || !['accept', 'reject'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Valid vote (accept/reject) is required'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!complaint.votingEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Voting is not enabled for this complaint'
      });
    }

    if (new Date() > complaint.votingDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Voting deadline has passed'
      });
    }

    // Check if user already voted
    const existingVote = complaint.votes.find(v => v.student.toString() === req.user.userId);
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this complaint'
      });
    }

    // Scope restriction for students
    if (req.user.userType === 'student') {
      const { department } = await User.findById(req.user.userId).select('department');
      if (complaint.votingScope === 'department' && complaint.department !== department) {
        return res.status(403).json({ success: false, message: 'You can only vote on department-scope complaints from your department' });
      }
      // If scope is 'college', any student may vote; no extra check needed
    }

    // Add the vote
    const voter = await User.findById(req.user.userId).select('name usn department userType');
    complaint.votes.push({
      student: req.user.userId,
      studentName: voter?.name || 'Dean',
      studentUSN: voter?.usn || 'DEAN',
      department: voter?.department || 'Administration',
      vote,
      reason: reason || '',
      votedAt: new Date()
    });

    // Update voting summary
    const totalVotes = complaint.votes.length;
    const acceptVotes = complaint.votes.filter(v => v.vote === 'accept').length;
    const rejectVotes = complaint.votes.filter(v => v.vote === 'reject').length;

    complaint.votingSummary = {
      totalVotes,
      acceptVotes,
      rejectVotes,
      acceptPercentage: totalVotes > 0 ? Math.round((acceptVotes / totalVotes) * 100) : 0,
      rejectPercentage: totalVotes > 0 ? Math.round((rejectVotes / totalVotes) * 100) : 0
    };

    await complaint.save();

    // Hide summary for students; only dean sees counts
    const responseData = req.user.userType === 'dean' ? { votingSummary: complaint.votingSummary } : {};

    res.json({
      success: true,
      message: 'Vote submitted successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enable voting for a complaint (Student who created it OR Dean)
router.post('/complaints/:complaintId/enable-voting', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student' && req.user.userType !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only the complaint owner (student) or Dean can enable voting'
      });
    }

    const { complaintId } = req.params;
    const { votingDeadline, votingScope } = req.body; // votingScope: 'department' | 'college'

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // If student, ensure this is their own complaint
    if (req.user.userType === 'student' && complaint.student.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the complaint owner can enable voting'
      });
    }

    // Default deadline: 7 days if not provided
    const deadline = votingDeadline ? new Date(votingDeadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    complaint.requiresVoting = true;
    complaint.votingEnabled = true;
    complaint.votingDeadline = deadline;
    complaint.votingScope = (votingScope === 'college' || votingScope === 'department') ? votingScope : 'department';
    complaint.openToAll = (complaint.votingScope === 'college'); // legacy compatibility
    
    await complaint.save();

    // Notify students according to scope and dean always
    let students = [];
    if (complaint.votingScope === 'college') {
      students = await User.find({ userType: 'student' });
    } else {
      students = await User.find({ userType: 'student', department: complaint.department });
    }
    const dean = await User.findOne({ userType: 'dean' });
    
    // Create notifications for students
    const studentNotifications = students.map(student => ({
      type: 'complaint_voting_enabled',
      message: `New complaint open for voting: ${complaint.title}`,
      recipient: student._id,
      actionData: {
        id: complaint._id.toString(),
        title: complaint.title,
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
        `New complaint open for voting: ${complaint.title}`,
        dean._id,
        {
          id: complaint._id.toString(),
          title: complaint.title,
          status: 'voting'
        },
        'normal'
      );
    }

    res.json({
      success: true,
      message: 'Voting enabled for complaint',
      data: complaint
    });
  } catch (error) {
    console.error('Error enabling voting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Send voting results to Dean (Dean only)
router.post('/complaints/:complaintId/send-to-dean', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only Dean can finalize and mark results as sent'
      });
    }

    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId)
      .populate('student', 'name usn department')
      .populate('votes.student', 'name usn department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.sentToDean) {
      return res.status(400).json({
        success: false,
        message: 'Results already sent to Dean'
      });
    }

    // Generate PDF report
    const pdfBuffer = await generateVotingReportPDF(complaint);

    // Find Dean
    const dean = await User.findOne({ userType: 'dean' });
    if (!dean) {
      return res.status(404).json({
        success: false,
        message: 'Dean not found in system'
      });
    }

    // Send email to Dean (you'll need to configure nodemailer)
    await sendVotingReportToDean(dean.email, complaint, pdfBuffer);

    // Update complaint
    complaint.sentToDean = true;
    complaint.sentToDeanAt = new Date();
    await complaint.save();

    res.json({
      success: true,
      message: 'Voting results sent to Dean successfully'
    });
  } catch (error) {
    console.error('Error sending to Dean:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Generate PDF report
async function generateVotingReportPDF(complaint) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('Student Complaint Voting Report', { align: 'center' });
      doc.moveDown();

      // Complaint Details
      doc.fontSize(16).text('Complaint Details', { underline: true });
      doc.fontSize(12);
      doc.text(`Title: ${complaint.title}`);
      doc.text(`Category: ${complaint.category}`);
      doc.text(`Priority: ${complaint.priority}`);
      doc.text(`Submitted by: ${complaint.studentName} (${complaint.studentUSN})`);
      doc.text(`Department: ${complaint.department}`);
      doc.text(`Date: ${complaint.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      doc.text('Description:');
      doc.text(complaint.description, { indent: 20 });
      doc.moveDown();

      // Voting Summary
      doc.fontSize(16).text('Voting Summary', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Votes: ${complaint.votingSummary.totalVotes}`);
      doc.text(`Accept Votes: ${complaint.votingSummary.acceptVotes} (${complaint.votingSummary.acceptPercentage}%)`);
      doc.text(`Reject Votes: ${complaint.votingSummary.rejectVotes} (${complaint.votingSummary.rejectPercentage}%)`);
      doc.moveDown();

      // Individual Votes
      doc.fontSize(16).text('Individual Votes', { underline: true });
      doc.fontSize(10);
      
      complaint.votes.forEach((vote, index) => {
        doc.text(`${index + 1}. ${vote.studentName} (${vote.studentUSN}) - ${vote.department}`);
        doc.text(`   Vote: ${vote.vote.toUpperCase()}`);
        if (vote.reason) {
          doc.text(`   Reason: ${vote.reason}`);
        }
        doc.text(`   Date: ${vote.votedAt.toLocaleDateString()}`);
        doc.moveDown(0.5);
      });

      // Footer
      doc.fontSize(10).text(`Report generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Send email to Dean (configure your email settings)
async function sendVotingReportToDean(deanEmail, complaint, pdfBuffer) {
  // Configure your email transporter
  const transporter = nodemailer.createTransport({
    // Add your email configuration here
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: deanEmail,
    subject: `Student Complaint Voting Results - ${complaint.title}`,
    html: `
      <h2>Student Complaint Voting Results</h2>
      <p><strong>Complaint Title:</strong> ${complaint.title}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Submitted by:</strong> ${complaint.studentName} (${complaint.studentUSN})</p>
      <p><strong>Department:</strong> ${complaint.department}</p>
      
      <h3>Voting Summary:</h3>
      <ul>
        <li>Total Votes: ${complaint.votingSummary.totalVotes}</li>
        <li>Accept Votes: ${complaint.votingSummary.acceptVotes} (${complaint.votingSummary.acceptPercentage}%)</li>
        <li>Reject Votes: ${complaint.votingSummary.rejectVotes} (${complaint.votingSummary.rejectPercentage}%)</li>
      </ul>
      
      <p>Please find the detailed voting report attached as PDF.</p>
      
      <p>Best regards,<br>Gate Pass System</p>
    `,
    attachments: [
      {
        filename: `voting-report-${complaint._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

// Send email to HOD (configure your email settings)
async function sendVotingReportToHod(hodEmail, complaint, pdfBuffer) {
  // Configure your email transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: hodEmail,
    subject: `Department Voting Results - ${complaint.title}`,
    html: `
      <h2>Department Voting Results</h2>
      <p><strong>Complaint Title:</strong> ${complaint.title}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Submitted by:</strong> ${complaint.studentName} (${complaint.studentUSN})</p>
      <p><strong>Department:</strong> ${complaint.department}</p>
      
      <h3>Voting Summary:</h3>
      <ul>
        <li>Total Votes: ${complaint.votingSummary.totalVotes}</li>
        <li>Accept Votes: ${complaint.votingSummary.acceptVotes} (${complaint.votingSummary.acceptPercentage}%)</li>
        <li>Reject Votes: ${complaint.votingSummary.rejectVotes} (${complaint.votingSummary.rejectPercentage}%)</li>
      </ul>
      
      <p>Please find the detailed voting report attached as PDF.</p>
      
      <p>Best regards,<br>Gate Pass System</p>
    `,
    attachments: [
      {
        filename: `voting-report-${complaint._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

// Finalize and route voting results based on scope
router.post('/complaints/:complaintId/finalize-results', auth, async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId)
      .populate('student', 'name usn department')
      .populate('votes.student', 'name usn department');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Ensure voting has ended or is enabled
    if (!complaint.votingEnabled) {
      return res.status(400).json({ success: false, message: 'Voting is not enabled for this complaint' });
    }

    const pdfBuffer = await generateVotingReportPDF(complaint);

    if (complaint.votingScope === 'college') {
      // Dean finalization
      if (req.user.userType !== 'dean') {
        return res.status(403).json({ success: false, message: 'Only Dean can finalize college-scope results' });
      }
      if (complaint.sentToDean) {
        return res.status(400).json({ success: false, message: 'Results already sent to Dean' });
      }
      const dean = await User.findOne({ userType: 'dean' });
      if (!dean) {
        return res.status(404).json({ success: false, message: 'Dean not found in system' });
      }
      await sendVotingReportToDean(dean.email, complaint, pdfBuffer);
      complaint.sentToDean = true;
      complaint.sentToDeanAt = new Date();
      await complaint.save();
      return res.json({ success: true, message: 'Voting results sent to Dean successfully' });
    } else {
      // Department finalization
      if (req.user.userType !== 'hod') {
        return res.status(403).json({ success: false, message: 'Only HOD can finalize department-scope results' });
      }
      const hod = await User.findById(req.user.userId);
      if (!hod || hod.userType !== 'hod' || hod.department !== complaint.department) {
        return res.status(403).json({ success: false, message: 'HOD can only finalize for their department' });
      }
      if (complaint.sentToHod) {
        return res.status(400).json({ success: false, message: 'Results already sent to HOD' });
      }
      await sendVotingReportToHod(hod.email, complaint, pdfBuffer);
      complaint.sentToHod = true;
      complaint.sentToHodAt = new Date();
      await complaint.save();
      return res.json({ success: true, message: 'Voting results sent to HOD successfully' });
    }
  } catch (error) {
    console.error('Error finalizing results:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;