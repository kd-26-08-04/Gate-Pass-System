const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cleanupService = require('./services/cleanupService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully');
  // Ensure dean user exists based on .env
  try {
    const User = require('./models/User');
    if (process.env.DEAN_EMAIL && process.env.DEAN_PASSWORD && process.env.DEAN_NAME) {
      const existingDean = await User.findOne({ userType: 'dean', email: process.env.DEAN_EMAIL });
      if (!existingDean) {
        const deanUser = new User({
          name: process.env.DEAN_NAME,
          email: process.env.DEAN_EMAIL,
          password: process.env.DEAN_PASSWORD,
          userType: 'dean',
          department: 'Computer Science',
          phone: '0000000000'
        });
        await deanUser.save();
        console.log(`✅ Dean user created: ${process.env.DEAN_EMAIL}`);
      } else {
        console.log('✅ Dean user already exists');
      }
    } else {
      console.log('ℹ️ DEAN_* env vars not fully set; skipping dean creation');
    }
  } catch (e) {
    console.error('Failed to ensure Dean user:', e.message);
  }
  // Start cleanup service after database connection
  cleanupService.start();
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gatepass', require('./routes/gatepass'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/voting', require('./routes/voting'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Gate Pass Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Gate Pass Management System - Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      gatepass: '/api/gatepass',
      complaints: '/api/complaints',
      voting: '/api/voting',
      messages: '/api/messages',
      notifications: '/api/notifications',
      health: '/api/health'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI}`);
});