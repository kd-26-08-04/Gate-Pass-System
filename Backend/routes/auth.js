const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, department, usn, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Helpers to derive department from USN/email
    const deptMapping = {
      CS: 'Computer Science',
      IT: 'Information Technology',
      EC: 'Electronics',
      ET: 'Electronics and Telecommunication',
      ME: 'Mechanical',
      CV: 'Civil',
      EE: 'Electrical',
    };

    const deriveDeptFromUSN = (u) => {
      if (!u || typeof u !== 'string' || u.length < 2) return null;
      // New USN format: starts with 2-letter department code, e.g., EE22187
      const code = u.substring(0, 2).toUpperCase();
      return deptMapping[code] ? { code, name: deptMapping[code] } : null;
    };

    const deriveDeptFromEmail = (e) => {
      if (!e || typeof e !== 'string') return null;
      // Only consider the local part before '@' to avoid 'it' in 'sbjit'
      const lower = e.toLowerCase().split('@')[0];
      // Try accurate token like .ee22, .et22, .cse22
      const tokenMatch = lower.match(/(?:^|[._-])([a-z]{2,3})\d{2}/i);
      if (tokenMatch) {
        const token = tokenMatch[1].toLowerCase();
        const tokenToCode = { cse: 'CS', cs: 'CS', ee: 'EE', et: 'ET', it: 'IT', me: 'ME', ec: 'EC', ece: 'EC', cv: 'CV' };
        const code = tokenToCode[token];
        if (code && deptMapping[code]) return { code, name: deptMapping[code] };
      }
      // Fallback keywords, with IT last
      const tokens = [
        { code: 'CS', keys: ['cse', 'cs', 'comp', 'computer'] },
        { code: 'EE', keys: ['ee', 'electrical'] },
        { code: 'ET', keys: ['et', 'entc', 'etc'] },
        { code: 'EC', keys: ['ec', 'ece', 'electro'] },
        { code: 'ME', keys: ['mech', 'me'] },
        { code: 'CV', keys: ['civil', 'cv'] },
        { code: 'IT', keys: ['it', 'info', 'infotech'] },
      ];
      for (const t of tokens) {
        if (t.keys.some(k => lower.includes(k))) {
          return { code: t.code, name: deptMapping[t.code] };
        }
      }
      return null;
    };

    // Student-specific constraints
    let finalDepartment = department;
    let usnUpper = usn?.toUpperCase();

    if (userType === 'student') {
      // Require USN
      if (!usnUpper) {
        return res.status(400).json({ message: 'USN is required for student registration' });
      }

      // Unique USN
      const existingUSN = await User.findOne({ usn: usnUpper });
      if (existingUSN) {
        return res.status(400).json({ message: 'Student with this USN already exists' });
      }

      const usnDept = deriveDeptFromUSN(usnUpper);
      if (!usnDept) {
        return res.status(400).json({ message: 'Invalid USN format. Expected two-letter department at the start (e.g., EE22187, CS22187).' });
      }

      const emailDept = deriveDeptFromEmail(email);
      if (!emailDept) {
        return res.status(400).json({ message: 'Email must contain department indicator (e.g., cs, it, ec, me, cv, ee, ch, bt)' });
      }

      if (emailDept.code !== usnDept.code) {
        return res.status(400).json({ message: `Department mismatch: Email indicates ${emailDept.name}, USN indicates ${usnDept.name}` });
      }

      // Enforce department from the derived values; ignore provided department
      finalDepartment = usnDept.name; // derived from leading USN code
    }

    // For HOD, check if department already has an HOD
    if (userType === 'hod') {
      const existingHOD = await User.findOne({ userType: 'hod', department });
      if (existingHOD) {
        return res.status(400).json({ message: 'HOD already exists for this department' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      userType,
      department: finalDepartment,
      usn: userType === 'student' ? usnUpper : undefined,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        department: user.department,
        usn: user.usn
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        department: user.department,
        usn: user.usn
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get departments list
router.get('/departments', (req, res) => {
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Electronics and Telecommunication',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];
  res.json(departments);
});

module.exports = router;