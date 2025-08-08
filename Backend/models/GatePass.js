const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentUSN: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  exitTime: {
    type: Date,
    required: true
  },
  expectedReturnTime: {
    type: Date,
    required: true
  },
  actualReturnTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  emergencyContact: {
    type: String,
    required: true
  },
  parentContact: {
    type: String,
    required: true
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  scannerUsed: {
    type: Boolean,
    default: false
  },
  scannerUsedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
gatePassSchema.index({ student: 1, createdAt: -1 });
gatePassSchema.index({ department: 1, status: 1 });
gatePassSchema.index({ status: 1, exitTime: 1 });

// Auto-expire gate passes
gatePassSchema.pre('save', function(next) {
  if (this.status === 'approved' && this.expectedReturnTime < new Date() && !this.isReturned) {
    this.status = 'expired';
  }
  next();
});

// Static method to clean up old pending gate passes
gatePassSchema.statics.cleanupOldPendingPasses = async function() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await this.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`Cleaned up ${result.deletedCount} old pending gate passes`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old pending gate passes:', error);
    return 0;
  }
};

module.exports = mongoose.model('GatePass', gatePassSchema);