# Gate Pass Mobile App

A React Native mobile application for the Gate Pass Management System built with Expo.

## Features

- **Student Features:**
  - Create gate pass requests
  - View gate pass status
  - Dashboard with statistics
  - Profile management

- **HOD Features:**
  - Approve/reject gate pass requests
  - View department gate passes
  - Dashboard with departmental statistics

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Expo CLI** - Install globally: `npm install -g @expo/cli`
4. **Expo Go app** on your mobile device (for testing)

## Installation

1. **Navigate to the mobile app directory:**
   ```bash
   cd "k:/Gate pass System/mobile-app"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install additional required packages:**
   ```bash
   npm install @react-native-picker/picker react-native-modal-datetime-picker
   ```

## Configuration

1. **Update API Base URL:**
   - Open `src/services/api.js`
   - Update the `API_BASE_URL` to match your backend server:
   ```javascript
   const API_BASE_URL = 'http://YOUR_BACKEND_IP:5000/api';
   ```

2. **For development with local backend:**
   - If testing on physical device, replace `localhost` with your computer's IP address
   - Example: `http://192.168.1.100:5000/api`

## Running the App

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Options to run:**
   - **On physical device:** Scan the QR code with Expo Go app
   - **On Android emulator:** Press 'a' in the terminal
   - **On iOS simulator:** Press 'i' in the terminal (macOS only)
   - **On web:** Press 'w' in the terminal

## Backend Setup

Make sure your backend server is running:

1. **Navigate to the project root:**
   ```bash
   cd "k:/Gate pass System"
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```
   MONGODB_URI=mongodb://localhost:27017/gatepass
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable components
│   ├── context/            # React Context (Authentication)
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── student/       # Student-specific screens
│   │   └── hod/           # HOD-specific screens
│   └── services/          # API services
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
└── package.json          # Dependencies
```

## Testing

### Test User Accounts

**Student Account:**
- Email: `student@test.com`
- Password: `password123`
- USN: `1XX21CS001`

**HOD Account:**
- Email: `hod@test.com`
- Password: `password123`
- Department: `Computer Science`

### Test Flow

1. **Student Flow:**
   - Login as student
   - Create a new gate pass
   - View gate pass status
   - Check dashboard statistics

2. **HOD Flow:**
   - Login as HOD
   - View pending requests
   - Approve/reject gate passes
   - View department statistics

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **Module not found errors:**
   ```bash
   npm install
   npx expo install --fix
   ```

3. **API connection issues:**
   - Check if backend server is running
   - Verify API_BASE_URL in `src/services/api.js`
   - Ensure your device/emulator can reach the backend

4. **Date picker issues:**
   ```bash
   npm install react-native-modal-datetime-picker
   ```

### Platform-Specific Issues

**Android:**
- Ensure Android emulator is running
- Check if USB debugging is enabled (for physical device)

**iOS:**
- Xcode must be installed (macOS only)
- iOS simulator requires macOS

## Building for Production

### Android APK

1. **Build the app:**
   ```bash
   eas build --platform android
   ```

2. **Install EAS CLI if not already installed:**
   ```bash
   npm install -g eas-cli
   ```

### iOS App

1. **Build the app:**
   ```bash
   eas build --platform ios
   ```

Note: iOS builds require Apple Developer account.

## Additional Features to Implement

- [ ] Push notifications for gate pass approvals
- [ ] QR code generation for gate passes
- [ ] Offline support
- [ ] Photo upload for gate passes
- [ ] Location tracking
- [ ] Biometric authentication

## Support

For any issues or questions, please contact the development team or refer to the Expo documentation: https://docs.expo.dev/