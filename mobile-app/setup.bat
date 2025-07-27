@echo off
echo Setting up Gate Pass Mobile App...
echo.

echo Installing dependencies...
npm install

echo.
echo Installing additional React Native packages...
npm install @react-native-picker/picker react-native-modal-datetime-picker

echo.
echo Setup completed successfully!
echo.
echo To run the app:
echo 1. Make sure your backend server is running
echo 2. Update the API URL in src/services/api.js
echo 3. Run: npm start
echo.
echo For Android: Press 'a' after starting
echo For iOS: Press 'i' after starting (macOS only)
echo For Web: Press 'w' after starting
echo.
pause