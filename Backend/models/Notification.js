const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'new_gatepass',
      'gatepass_approved',
      'gatepass_rejected', 
      'gatepass_expired',
      'new_complaint',
      'complaint_response',
      'complaint_status_update',
      'complaint_voting_enabled',
      'new_message',
      'system_update'
    ]
  },
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionData: {
    // Store related data like gatepass ID, complaint ID, etc.
    id: String,
    title: String,
    destination: String,
    status: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);