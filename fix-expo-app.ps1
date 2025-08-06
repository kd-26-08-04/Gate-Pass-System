# Fix Expo App Issues Script
# This script fixes common issues preventing the Expo app from starting

Write-Host "🔧 Starting Expo App Fix Process..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Set location to project root
Set-Location "k:\Project for SALE\Gate pass System"

Write-Host "`n📱 Step 1: Fixing Mobile App Issues..." -ForegroundColor Yellow

# Navigate to mobile app directory
Set-Location "mobile-app"

# Check if StyleSheet import exists in App.js
Write-Host "🔍 Checking App.js StyleSheet import..." -ForegroundColor Green
$appJsContent = Get-Content "App.js" -Raw
if ($appJsContent -match "StyleSheet\.create" -and $appJsContent -notmatch "import.*StyleSheet.*from.*react-native") {
    Write-Host "❌ StyleSheet import missing - already fixed by Zencoder" -ForegroundColor Red
} else {
    Write-Host "✅ StyleSheet import is correct" -ForegroundColor Green
}

# Check for React version compatibility issues
Write-Host "`n🔍 Checking for React version compatibility..." -ForegroundColor Green
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$reactVersion = $packageJson.dependencies.react
$expoVersion = $packageJson.dependencies.expo

Write-Host "Current React version: $reactVersion" -ForegroundColor White
Write-Host "Current Expo version: $expoVersion" -ForegroundColor White

if ($reactVersion -match "19\.") {
    Write-Host "⚠️  Warning: React 19 may have compatibility issues with current Expo SDK" -ForegroundColor Yellow
    Write-Host "   Would you like to downgrade to React 18? (Recommended)" -ForegroundColor Yellow
    $downgrade = Read-Host "Downgrade React to 18.x? (y/n)"
    
    if ($downgrade -eq 'y' -or $downgrade -eq 'Y') {
        Write-Host "📦 Downgrading React to version 18..." -ForegroundColor Green
        npm install react@^18.2.0
        Write-Host "✅ React downgraded successfully" -ForegroundColor Green
    }
}

# Clear caches
Write-Host "`n🧹 Clearing caches..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Write-Host "Clearing node_modules..." -ForegroundColor Yellow
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".expo") {
    Write-Host "Clearing .expo cache..." -ForegroundColor Yellow
    Remove-Item ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}

# Reinstall dependencies
Write-Host "`n📦 Reinstalling dependencies..." -ForegroundColor Green
npm install

# Fix potential peer dependency issues
Write-Host "`n🔧 Fixing peer dependencies..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "`n🔙 Step 2: Checking Backend Setup..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location "..\Backend"

# Check if backend dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Green
    npm install
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Check if MongoDB is mentioned in environment
$envContent = Get-Content ".env" -Raw
if ($envContent -match "mongodb://localhost:27017") {
    Write-Host "⚠️  Backend uses local MongoDB. Make sure it's running:" -ForegroundColor Yellow
    Write-Host "   • Install MongoDB Community Edition" -ForegroundColor White
    Write-Host "   • Start MongoDB service" -ForegroundColor White
    Write-Host "   • Or use MongoDB Atlas (cloud)" -ForegroundColor White
}

Write-Host "`n🚀 Step 3: Starting the Application..." -ForegroundColor Yellow

# Start backend server in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "Set-Location 'k:\Project for SALE\Gate pass System\Backend'; npm run dev" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Navigate back to mobile app
Set-Location "..\mobile-app"

# Show next steps
Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running (if using local database)" -ForegroundColor White
Write-Host "2. Check your local IP address for mobile testing:" -ForegroundColor White
Write-Host "   • Run: ipconfig (Windows) to get your local IP" -ForegroundColor Gray
Write-Host "   • Update the IP in src/services/api.js if needed" -ForegroundColor Gray
Write-Host "3. Start the Expo development server:" -ForegroundColor White
Write-Host "   • Run: npx expo start" -ForegroundColor Gray
Write-Host "4. Choose your connection method:" -ForegroundColor White
Write-Host "   • Scan QR code with Expo Go app" -ForegroundColor Gray
Write-Host "   • Use Tunnel mode if LAN doesn't work" -ForegroundColor Gray
Write-Host ""
Write-Host "🐛 If you still have issues:" -ForegroundColor Cyan
Write-Host "• Run diagnostics: node diagnose-expo-issues.js" -ForegroundColor Gray
Write-Host "• Clear Expo cache: npx expo r -c" -ForegroundColor Gray
Write-Host "• Check firewall settings" -ForegroundColor Gray
Write-Host "• Try different connection modes (LAN vs Tunnel)" -ForegroundColor Gray

Write-Host "`n🎉 Ready to start Expo!" -ForegroundColor Green
$startExpo = Read-Host "Start Expo development server now? (y/n)"

if ($startExpo -eq 'y' -or $startExpo -eq 'Y') {
    Write-Host "🚀 Starting Expo..." -ForegroundColor Green
    npx expo start
}