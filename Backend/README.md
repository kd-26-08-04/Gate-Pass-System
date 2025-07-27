# Gate Pass Backend API

Backend API server for the Gate Pass Management System mobile application.

## 📁 Backend Structure

```
Backend/
├── models/             # MongoDB models
│   ├── User.js         # User model (Students & HODs)
│   └── GatePass.js     # Gate Pass model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   └── gatepass.js     # Gate Pass management routes
├── middleware/         # Custom middleware
│   └── auth.js         # JWT authentication middleware
├── server.js           # Main server file
├── package.json        # Backend dependencies
├── .env                # Environment variables
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment
Edit `.env` file with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Verify Server
- API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/gatepass |
| `JWT_SECRET` | JWT secret key | (required) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `NODE_ENV` | Environment mode | development |

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `.env`
3. Server will auto-create database and collections

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Gate Pass Management
- `POST /api/gatepass/create` - Create gate pass
- `GET /api/gatepass/my-passes` - Get user's gate passes
- `GET /api/gatepass/pending` - Get pending approvals (HOD)
- `GET /api/gatepass/department` - Get department gate passes (HOD)
- `PATCH /api/gatepass/:id/approve` - Approve gate pass
- `PATCH /api/gatepass/:id/reject` - Reject gate pass

### System
- `GET /` - API information
- `GET /api/health` - Health check

## 🚀 Deployment

### For Development
```bash
npm run dev
```

### For Production
```bash
npm start
```

### Environment Configuration for Deployment

1. **Update `.env` for production:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://your-hosted-db-connection-string
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Common Deployment Platforms:**
   - **Heroku**: Set environment variables in dashboard
   - **Railway**: Use railway.app environment variables
   - **Vercel**: Configure in vercel.json
   - **DigitalOcean**: Set environment variables in app config

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Input validation
- CORS configuration
- Environment-based configuration

## 📱 Mobile App Integration

The mobile app should connect to:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-domain.com/api`

Update mobile app's `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Development
// const API_BASE_URL = 'https://your-backend-domain.com/api'; // Production
```

## 🔄 Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm run server # Alias for dev
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  userType: String, // 'student' or 'hod'
  department: String,
  usn: String, // For students
  phone: String,
  isActive: Boolean
}
```

### Gate Pass Model
```javascript
{
  student: ObjectId,
  studentName: String,
  studentUSN: String,
  department: String,
  reason: String,
  destination: String,
  exitTime: Date,
  expectedReturnTime: Date,
  actualReturnTime: Date,
  status: String, // 'pending', 'approved', 'rejected', 'expired'
  approvedBy: ObjectId,
  rejectionReason: String,
  emergencyContact: String,
  parentContact: String
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `npx kill-port 5000`

3. **JWT Secret Missing**
   - Set JWT_SECRET in `.env`

4. **CORS Issues**
   - Update FRONTEND_URL in `.env`

### Logs
Server logs will show:
- MongoDB connection status
- Server startup information
- API endpoint access

## 📞 Support

For backend issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints with Postman
4. Check MongoDB connection

---

**Backend API for Gate Pass Management System** 🛡️