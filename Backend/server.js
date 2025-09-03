const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cleanupService = require('./services/cleanupService');

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy (needed on Render/Heroku behind proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Compression for responses
app.use(compression());

// Robust CORS config: allow comma-separated list in FRONTEND_URLS or single FRONTEND_URL
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser clients (e.g., curl/postman) and same-origin
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Basic global rate limit (adjust as needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // per IP
});
app.use('/api', apiLimiter);

// MongoDB Connection with safer defaults
mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
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
            password: process.env.DEAN_PASSWORD, // hashed by pre-save hook
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
  .catch((err) => console.error('MongoDB connection error:', err));

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
    env: process.env.NODE_ENV || 'development',
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

// Centralized error handler (minimal)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌐 API URL: https://gate-pass-system-1.onrender.com:${PORT}`);
});

// Safety: exit on unhandled rejections in production
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Keep-alive system for Render: ping health endpoint every 14 minutes
if (process.env.RENDER === 'true' || process.env.KEEP_ALIVE === 'true') {
  const axios = require('axios');
  const SELF_URL = process.env.SELF_URL || `https://gate-pass-system-1.onrender.com:${PORT}/api/health`;
  setInterval(() => {
    axios.get(SELF_URL)
      .then(() => console.log('🔄 Keep-alive ping sent'))
      .catch((err) => console.error('Keep-alive ping failed:', err.message));
  }, 14 * 60 * 1000); // every 14 minutes
}