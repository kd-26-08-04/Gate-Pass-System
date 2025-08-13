const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    required: true,
    enum: ['student', 'hod', 'dean']
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Computer Science',
      'Information Technology',
      'Electronics',
      'Electronics and Telecommunication',
      'Mechanical',
      'Civil',
      'Electrical',
      'Chemical',
      'Biotechnology'
    ]
  },
  usn: {
    type: String,
    required: function() {
      return this.userType === 'student';
    },
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Extract department from USN for students
userSchema.pre('save', function(next) {
  if (this.userType === 'student' && this.usn) {
    // New USN format: starts with 2-letter department code, e.g., EE22187
    const deptCode = this.usn.substring(0, 2).toUpperCase();
    const deptMapping = {
      'CS': 'Computer Science',
      'EC': 'Electronics',
      'ET': 'Electronics and Telecommunication',
      'ME': 'Mechanical',
      'CV': 'Civil',
      'EE': 'Electrical',
    };

    if (deptMapping[deptCode]) {
      this.department = deptMapping[deptCode];
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);