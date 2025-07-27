# Gate Pass Management System - Mobile App

A React Native mobile application for managing student gate passes with MongoDB backend.

## 📱 Mobile Application Features

- **Student App**: Create gate pass requests, view status, dashboard
- **HOD App**: Approve/reject requests, department management
- **Real-time Updates**: Live status tracking
- **Cross-platform**: iOS and Android support
- **Modern UI**: Material Design components

## 🏗️ Project Structure

```
Gate pass System/
├── mobile-app/              # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # UI components
│   │   ├── navigation/     # Navigation setup
│   │   └── services/       # API services
│   ├── App.js              # Main app component
│   └── package.json        # Mobile app dependencies
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Authentication middleware
├── server.js               # Backend server
└── package.json           # Backend dependencies
```

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### 3. Start Backend Server
```bash
npm run dev
```

### 4. Install Mobile App Dependencies
```bash
npm run install-mobile
```

### 5. Start Mobile App
```bash
npm run mobile
```

### 6. Test on Device
- Install **Expo Go** app
- Scan QR code to run on device

## 📱 Mobile App Development

### Prerequisites
- Node.js (v14+)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your device

### Development Commands
```bash
# Start mobile app
npm run mobile

# Install mobile dependencies
npm run install-mobile

# Start backend server
npm run dev
```

## 🛠️ Technology Stack

### Mobile App
- **React Native** with Expo
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **AsyncStorage** for local storage
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## 👥 Test Accounts

### Student Account
- Email: `student@test.com`
- Password: `password123`
- USN: `1XX21CS001`

### HOD Account
- Email: `hod@test.com`
- Password: `password123`
- Department: `Computer Science`

## 📱 App Features

### Student Features
- ✅ Login/Register
- ✅ Dashboard with statistics
- ✅ Create gate pass requests
- ✅ View all gate passes
- ✅ Status tracking
- ✅ Profile management

### HOD Features
- ✅ HOD dashboard
- ✅ Approve/reject requests
- ✅ Department gate passes
- ✅ Search and filter
- ✅ Bulk operations

## 🔧 Configuration

### Mobile App API Configuration
Update `mobile-app/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

### Database Configuration
The app uses MongoDB with these collections:
- `users` - Student and HOD accounts
- `gatepasses` - Gate pass requests

## 📦 Build & Deploy

### Android APK
```bash
cd mobile-app
eas build --platform android
```

### iOS App
```bash
cd mobile-app
eas build --platform ios
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Gate Pass
- `POST /api/gatepass/create` - Create gate pass
- `GET /api/gatepass/my-passes` - Get user's gate passes
- `GET /api/gatepass/pending` - Get pending approvals (HOD)
- `PATCH /api/gatepass/:id/approve` - Approve gate pass
- `PATCH /api/gatepass/:id/reject` - Reject gate pass

## 📱 Mobile App Screenshots

The app includes:
- Modern authentication screens
- Student dashboard with statistics
- Gate pass creation form
- HOD approval interface
- Real-time status updates
- Professional UI/UX

## 🐛 Troubleshooting

### Common Issues
1. **Can't connect to backend**: Check API URL and server status
2. **Metro bundler errors**: Run `npx expo start --clear`
3. **Module not found**: Run `npm install` in mobile-app folder

### Device Connection Issues
- Ensure your device and computer are on the same network
- Update the API URL with your computer's IP address
- Check firewall settings

## 📞 Support

For technical support:
1. Check the troubleshooting section
2. Review Expo documentation
3. Verify backend server is running
4. Check MongoDB connection

## 📄 License

MIT License - Feel free to use and modify for your needs.

---

**Built with React Native & Expo for mobile-first gate pass management** 📱✨