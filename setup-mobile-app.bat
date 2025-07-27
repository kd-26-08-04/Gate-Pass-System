@echo off
cls
echo ================================================================
echo          Gate Pass Management System - Mobile App Setup
echo ================================================================
echo.

echo [1/6] Checking project structure...
echo.

REM Check if required folders exist
if exist "mobile-app" (
    echo ✓ Mobile app folder found
) else (
    echo ✗ Mobile app folder missing! Please ensure mobile-app folder exists.
    pause
    exit /b 1
)

if exist "models" (
    echo ✓ Models folder found
) else (
    echo ✗ Models folder missing!
    pause
    exit /b 1
)

if exist "routes" (
    echo ✓ Routes folder found
) else (
    echo ✗ Routes folder missing!
    pause
    exit /b 1
)

echo.
echo [2/6] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed successfully

echo.
echo [3/6] Installing mobile app dependencies...
cd mobile-app
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install mobile app dependencies
    pause
    exit /b 1
)
echo ✓ Mobile app dependencies installed successfully

echo.
echo [4/6] Installing additional React Native packages...
call npm install @react-native-picker/picker react-native-modal-datetime-picker
if %errorlevel% neq 0 (
    echo ✗ Failed to install additional packages
    pause
    exit /b 1
)
echo ✓ Additional packages installed successfully

cd ..

echo.
echo [5/6] Setting up environment configuration...
if not exist ".env" (
    echo Creating .env file...
    echo PORT=5000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/gatepass >> .env
    echo JWT_SECRET=your_jwt_secret_key_here_make_it_strong >> .env
    echo NODE_ENV=development >> .env
    echo ✓ Environment file created
) else (
    echo ✓ Environment file already exists
)

echo.
echo [6/6] Final setup verification...
echo.
echo Project Structure:
echo ├── mobile-app/          # React Native mobile app
echo ├── models/             # MongoDB models
echo ├── routes/             # API routes
echo ├── middleware/         # Authentication middleware
echo ├── server.js           # Backend server
echo └── package.json        # Backend dependencies
echo.

echo ================================================================
echo                       SETUP COMPLETED! 
echo ================================================================
echo.
echo Your Gate Pass Management System is now set up as a MOBILE APP!
echo.
echo NEXT STEPS:
echo.
echo 1. Make sure MongoDB is running on your system
echo.
echo 2. Start the backend server:
echo    npm run dev
echo.
echo 3. Start the mobile app (in another terminal):
echo    npm run mobile
echo.
echo 4. Install Expo Go app on your mobile device
echo.
echo 5. Scan the QR code to run the app on your device
echo.
echo 6. Test with these accounts:
echo    Student: student@test.com / password123
echo    HOD:     hod@test.com / password123
echo.
echo IMPORTANT: Update the API URL in mobile-app/src/services/api.js
echo with your computer's IP address for device testing!
echo.
echo ================================================================
echo                    MOBILE APP READY! 📱
echo ================================================================
pause