# 🔧 Expo App Troubleshooting Guide

## ✅ **ISSUES FIXED**

### 1. **Critical StyleSheet Import Error** ❌ → ✅
- **Problem**: App.js was using `StyleSheet.create()` without importing StyleSheet
- **Fixed**: Added `import { StyleSheet } from 'react-native';` to App.js
- **Result**: App no longer crashes on startup

### 2. **API Connection Issues** ⚠️ → ✅  
- **Problem**: Hardcoded IP address may not match your network
- **Fixed**: Improved API URL detection to automatically use correct host IP
- **Fallbacks**: Android emulator (10.0.2.2) and common LAN IP (192.168.1.100)

---

## 🚀 **HOW TO START THE APP**

### **Option 1: Run the Fix Script** (Recommended)
```powershell
Set-Location "k:\Project for SALE\Gate pass System"
.\fix-expo-app.ps1
```

### **Option 2: Manual Steps**
1. **Start Backend Server**:
   ```powershell
   Set-Location "k:\Project for SALE\Gate pass System\Backend"
   npm install
   npm run dev
   ```

2. **Start Mobile App**:
   ```powershell
   Set-Location "k:\Project for SALE\Gate pass System\mobile-app"
   npm install
   npx expo start
   ```

3. **Connect Device**:
   - Install **Expo Go** app on your phone
   - Scan QR code from terminal
   - Or use Android/iOS simulator

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **App Won't Open After Scanning QR Code**

#### **Solution 1: Check Network Connection**
```powershell
# Get your computer's IP address
ipconfig

# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.105
```

#### **Solution 2: Use Tunnel Mode**
```bash
npx expo start --tunnel
```
**Pros**: Works through firewalls and complex networks  
**Cons**: Slower than LAN mode

#### **Solution 3: Clear All Caches**
```powershell
# Clear Expo cache
npx expo r -c

# Clear npm cache
npm cache clean --force

# Clear node_modules
Remove-Item "node_modules" -Recurse -Force
npm install
```

### **"Network Request Failed" Errors**

#### **Check Backend Status**
1. Open browser: `http://gate-pass-system-9vid.onrender.com`
2. Should see: "Gate Pass Management System - Backend API"
3. If not working, check MongoDB connection

#### **Fix API URL**
Edit `mobile-app/src/services/api.js`:
```javascript
// Replace the hardcoded IP with your actual IP
return 'http://YOUR_ACTUAL_IP:5000/api';
```

### **MongoDB Connection Issues**

#### **Using Local MongoDB**
```powershell
# Install MongoDB Community Edition
# Start MongoDB service
net start MongoDB

# Or use MongoDB Compass GUI
```

#### **Using MongoDB Atlas** (Recommended)
1. Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `Backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gatepass
   ```

### **React Version Compatibility**

#### **Current Setup Issues**
- React 19.0.0 with Expo SDK 53 may have compatibility issues
- **Fix**: Downgrade React to 18.x

```powershell
Set-Location "mobile-app"
npm install react@^18.2.0
npm install
```

---

## 📱 **DEVICE-SPECIFIC SOLUTIONS**

### **Android Device**
- **USB Debugging**: Enable in Developer Options
- **Same WiFi**: Ensure phone and computer on same network
- **Firewall**: Allow Metro bundler through Windows Firewall

### **iOS Device**
- **Same WiFi**: Must be on same network as development machine
- **Trust Developer**: May need to trust development certificate

### **Android Emulator**
```bash
# API URL should use
http://10.0.2.2:5000/api
```

### **iOS Simulator**
```bash
# API URL should use
http://gate-pass-system-9vid.onrender.com/api
```

---

## 🔍 **DIAGNOSTIC TOOLS**

### **Run Diagnostics**
```powershell
Set-Location "mobile-app"
node diagnose-expo-issues.js
```

### **Check Expo Doctor**
```bash
npx expo doctor
```

### **Metro Bundler Logs**
- Look for errors in terminal running `expo start`
- Check for failed imports or syntax errors

---

## 🌐 **NETWORK TROUBLESHOOTING**

### **Find Your Local IP**
```powershell
# Windows
ipconfig | findstr "IPv4"

# Or use GUI
Control Panel → Network → Change adapter settings
```

### **Test Backend Connection**
```powershell
# From your phone's browser, visit:
http://YOUR_IP_ADDRESS:5000

# Should show backend API info
```

### **Firewall Rules**
- Allow **Node.js** through Windows Firewall
- Allow **Expo CLI** through Windows Firewall
- Allow ports **5000** (backend) and **19000-19006** (Expo)

---

## 📞 **GETTING HELP**

### **If App Still Won't Start**
1. ✅ **Fixed StyleSheet import** - should resolve crash
2. ✅ **Fixed API configuration** - should resolve network issues
3. 🔧 **Run**: `.\fix-expo-app.ps1`
4. 🔍 **Run diagnostics**: `node diagnose-expo-issues.js`
5. 🧹 **Clear all caches** and reinstall dependencies

### **Log Files to Check**
- Expo Metro bundler terminal output
- Backend server terminal output (`npm run dev`)
- Browser developer console (if testing web version)
- MongoDB logs (if using local MongoDB)

---

## ✨ **SUCCESS CHECKLIST**

- ✅ No StyleSheet import errors
- ✅ Backend server running on port 5000
- ✅ MongoDB connected
- ✅ Mobile device and computer on same WiFi
- ✅ Firewall allows Node.js applications
- ✅ API URL matches your network configuration
- ✅ All dependencies installed
- ✅ Expo Go app installed on device

**When all items are checked, your app should work! 🎉**