const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get messages for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find messages where user is a recipient
    const messages = await Message.find({
      'recipients.user': userId,
      isActive: true
    })
    .populate('sender', 'name department')
    .sort({ createdAt: -1 })
    .lean();

    // Transform messages to include read status for current user
    const transformedMessages = messages.map(message => {
      const recipient = message.recipients.find(r => r.user.toString() === userId);
      return {
        _id: message._id,
        title: message.title,
        content: message.content,
        priority: message.priority,
        senderName: message.senderName,
        senderDepartment: message.senderDepartment,
        isRead: recipient ? recipient.isRead : false,
        readAt: recipient ? recipient.readAt : null,
        createdAt: message.createdAt
      };
    });

    res.json({
      success: true,
      messages: transformedMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send message (HOD to department students)
router.post('/send', auth, async (req, res) => {
  try {
    const { title, content, priority = 'normal', department } = req.body;
    const senderId = req.user.id;

    // Verify sender is HOD
    if (req.user.userType !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Only HODs can send department messages'
      });
    }

    // Get all students in the department
    const students = await User.find({
      department: department,
      userType: 'student',
      isActive: true
    }).select('_id');

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found in the department'
      });
    }

    // Create recipients array
    const recipients = students.map(student => ({
      user: student._id,
      isRead: false
    }));

    // Create message
    const message = new Message({
      title,
      content,
      priority,
      sender: senderId,
      senderName: req.user.name,
      senderDepartment: req.user.department,
      recipients,
      department
    });

    await message.save();

    // Create notifications for all recipients
    const notifications = students.map(student => ({
      type: 'new_message',
      message: `New message from HOD: ${title}`,
      recipient: student._id,
      actionData: {
        id: message._id.toString(),
        title: title
      },
      priority: priority === 'high' ? 'high' : 'normal'
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: 'Message sent successfully',
      recipientCount: students.length
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark message as read
router.put('/read/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Find and update the recipient's read status
    const recipientIndex = message.recipients.findIndex(
      r => r.user.toString() === userId
    );

    if (recipientIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not a recipient of this message'
      });
    }

    if (!message.recipients[recipientIndex].isRead) {
      message.recipients[recipientIndex].isRead = true;
      message.recipients[recipientIndex].readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      'recipients.user': userId,
      'recipients.isRead': false,
      isActive: true
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

module.exports = router;