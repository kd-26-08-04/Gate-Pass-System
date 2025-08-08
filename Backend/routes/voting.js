const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Get all complaints available for voting (for students)
router.get('/complaints', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view voting complaints'
      });
    }

    const complaints = await Complaint.find({
      $or: [
        { 
          votingEnabled: true,
          votingDeadline: { $gt: new Date() },
          openToAll: true
        },
        {
          votingEnabled: true,
          votingDeadline: { $gt: new Date() },
          department: req.user.department // Department-specific complaints
        }
      ],
      'votes.student': { $ne: req.user.id } // Exclude complaints user already voted on
    })
    .populate('student', 'name usn department')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
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
    if (req.user.userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can vote on complaints'
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
    const existingVote = complaint.votes.find(v => v.student.toString() === req.user.id);
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this complaint'
      });
    }

    // Add the vote
    complaint.votes.push({
      student: req.user.id,
      studentName: req.user.name,
      studentUSN: req.user.usn,
      department: req.user.department,
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

    res.json({
      success: true,
      message: 'Vote submitted successfully',
      data: {
        votingSummary: complaint.votingSummary
      }
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enable voting for a complaint (HOD only)
router.post('/complaints/:complaintId/enable-voting', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Only HODs can enable voting'
      });
    }

    const { complaintId } = req.params;
    const { votingDeadline } = req.body;

    if (!votingDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Voting deadline is required'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.requiresVoting = true;
    complaint.votingEnabled = true;
    complaint.votingDeadline = new Date(votingDeadline);
    
    await complaint.save();

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

// Send voting results to Dean
router.post('/complaints/:complaintId/send-to-dean', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Only HODs can send results to Dean'
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
  const transporter = nodemailer.createTransporter({
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

module.exports = router;