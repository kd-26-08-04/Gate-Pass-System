const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['gate_pass', 'system_issue', 'security', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  response: {
    type: String,
    default: null
  },
  responseDate: {
    type: Date,
    default: null
  },
  relatedGatePass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GatePass',
    default: null
  },
  // Voting system fields
  requiresVoting: {
    type: Boolean,
    default: false
  },
  openToAll: {
    type: Boolean,
    default: false
  },
  // Voting visibility scope: 'department' limits to same department; 'college' opens to all students
  votingScope: {
    type: String,
    enum: ['department', 'college'],
    default: 'department'
  },
  votingEnabled: {
    type: Boolean,
    default: false
  },
  votingDeadline: {
    type: Date,
    default: null
  },
  votes: [{
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
    vote: {
      type: String,
      enum: ['accept', 'reject'],
      required: true
    },
    reason: {
      type: String,
      maxlength: 500
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  votingSummary: {
    totalVotes: {
      type: Number,
      default: 0
    },
    acceptVotes: {
      type: Number,
      default: 0
    },
    rejectVotes: {
      type: Number,
      default: 0
    },
    acceptPercentage: {
      type: Number,
      default: 0
    },
    rejectPercentage: {
      type: Number,
      default: 0
    }
  },
  sentToDean: {
    type: Boolean,
    default: false
  },
  sentToDeanAt: {
    type: Date,
    default: null
  },
  deanResponse: {
    type: String,
    default: null
  },
  deanResponseDate: {
    type: Date,
    default: null
  },
  // Department scope finalization tracking
  sentToHod: {
    type: Boolean,
    default: false
  },
  sentToHodAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);