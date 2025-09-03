# Gate Pass System - Mobile App Setup Guide

## 🚀 Complete React Native Mobile App Implementation

Your Gate Pass System has been successfully converted to a React Native mobile app using Expo! Here's everything you need to get started.

## 📱 What's Been Created

### Mobile App Structure
```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # Authentication context
│   ├── navigation/         # App navigation setup
│   ├── screens/           # All app screens
│   │   ├── auth/          # Login & Register
│   │   ├── student/       # Student dashboard & features
│   │   ├── hod/           # HOD dashboard & features
│   │   └── shared/        # Shared screens
│   └── services/          # API integration
├── App.js                 # Main app component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

### Key Features Implemented
- ✅ Authentication (Login/Register)
- ✅ Student Dashboard with statistics
- ✅ Create Gate Pass requests
- ✅ View My Gate Passes
- ✅ HOD Dashboard
- ✅ Approve/Reject Gate Passes
- ✅ Department Gate Pass management
- ✅ Profile management
- ✅ Real-time status updates
- ✅ Search and filter functionality

## 🛠️ Installation & Setup

### Prerequisites
1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g @expo/cli`
4. **Expo Go** app on your mobile device

### Step 1: Install Dependencies
```bash
cd "k:/Gate pass System/mobile-app"
npm install
```

### Step 2: Install Additional Packages
```bash
npm install @react-native-picker/picker react-native-modal-datetime-picker
```

### Step 3: Configure API Connection
1. Open `src/services/api.js`
2. Update the API base URL:
```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

**Important**: Replace `YOUR_COMPUTER_IP` with your actual IP address if testing on a physical device.

### Step 4: Start the Backend Server
```bash
cd "k:/Gate pass System"
npm install
npm run dev
```

### Step 5: Start the Mobile App
```bash
cd "k:/Gate pass System/mobile-app"
npm start
```

## 📱 Testing the App

### Option 1: Physical Device (Recommended)
1. Install **Expo Go** from App Store/Play Store
2. Scan the QR code displayed in terminal
3. The app will load on your device

### Option 2: Emulator
- **Android**: Press 'a' in the terminal (requires Android Studio)
- **iOS**: Press 'i' in the terminal (macOS only, requires Xcode)

### Option 3: Web Browser
- Press 'w' in the terminal (limited mobile features)

## 🔧 Configuration

### Backend Setup
Make sure your backend has these environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Mobile App Configuration
Update `src/services/api.js` with your backend URL:
```javascript
// For localhost (emulator)
const API_BASE_URL = 'http://gate-pass-system-9vid.onrender.com/api';

// For physical device (replace with your IP)
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

## 👥 Test User Accounts

### Student Account
- **Email**: `student@test.com`
- **Password**: `password123`
- **USN**: `1XX21CS001`
- **Department**: Computer Science

### HOD Account
- **Email**: `hod@test.com`
- **Password**: `password123`
- **Department**: Computer Science

## 🎯 App Features

### Student Features
- **Dashboard**: View gate pass statistics
- **Create Gate Pass**: Submit new requests
- **My Gate Passes**: View all your requests
- **Status Tracking**: Real-time status updates
- **Profile Management**: View and manage account

### HOD Features
- **Dashboard**: Department statistics
- **Pending Approvals**: Review and approve/reject requests
- **Department Passes**: View all department gate passes
- **Filter & Search**: Find specific gate passes
- **Bulk Actions**: Efficient approval workflow

## 🔄 Common Workflows

### Student Workflow
1. Login → Dashboard
2. Create Gate Pass → Fill details → Submit
3. View status in "My Gate Passes"
4. Mark as returned when back

### HOD Workflow
1. Login → Dashboard
2. View "Pending Approvals"
3. Review details → Approve/Reject
4. Monitor department activity

## 🛡️ Security Features
- JWT token authentication
- Secure API endpoints
- Input validation
- Error handling
- Session management

## 📊 Database Integration
The app uses your existing MongoDB database with the same models:
- **Users**: Student and HOD accounts
- **GatePass**: Gate pass requests and approvals
- **Authentication**: JWT tokens for security

## 🎨 UI/UX Features
- Material Design components
- Responsive layout
- Loading states
- Error handling
- Toast notifications
- Pull-to-refresh
- Search functionality

## 🚀 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Build APK
eas build --platform android --profile preview
```

### iOS App
```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

## 🔧 Troubleshooting

### Common Issues

1. **Can't connect to backend**
   - Check if backend server is running
   - Verify API URL in `src/services/api.js`
   - Ensure your device can reach the backend

2. **Metro bundler errors**
   ```bash
   npx expo start --clear
   ```

3. **Module not found**
   ```bash
   npm install
   npx expo install --fix
   ```

4. **Date picker not working**
   ```bash
   npm install react-native-modal-datetime-picker
   ```

### Device-Specific Issues

**Android:**
- Enable USB debugging
- Check if emulator is running
- Verify Android Studio setup

**iOS:**
- Requires macOS and Xcode
- Check iOS simulator status

## 📈 Performance Optimization
- Lazy loading for screens
- Efficient API calls
- Optimized list rendering
- Image optimization
- Memory management

## 🔮 Future Enhancements
- [ ] Push notifications
- [ ] QR code generation
- [ ] Offline support
- [ ] Photo upload
- [ ] Location tracking
- [ ] Biometric authentication
- [ ] Dark mode
- [ ] Multi-language support

## 📞 Support
For issues or questions:
1. Check the troubleshooting section
2. Review Expo documentation
3. Contact development team

## 🎉 Congratulations!
Your Gate Pass System is now a fully functional mobile app! Students and HODs can now manage gate passes directly from their mobile devices with a modern, intuitive interface.

---

**Made with ❤️ using React Native & Expo**