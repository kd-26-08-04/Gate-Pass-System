# Comprehensive Fix Script for Gate Pass System
Write-Host "🚀 Starting comprehensive fix for Gate Pass System..." -ForegroundColor Green

$rootPath = "k:\Project for SALE\Gate pass System"
$mobilePath = "$rootPath\mobile-app"
$backendPath = "$rootPath\Backend"

# Function to check if a command exists
function Test-Command($command) {
    return Get-Command $command -ErrorAction SilentlyContinue
}

# Step 1: Kill existing processes
Write-Host "🔄 Killing existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "expo" -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 2: Clean npm cache
Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 3: Install/Update global packages
Write-Host "📦 Installing global packages..." -ForegroundColor Yellow
npm install -g expo-cli@latest
npm install -g @expo/cli@latest

# Step 4: Clean and reinstall backend dependencies
Write-Host "🔧 Setting up Backend..." -ForegroundColor Cyan
Set-Location $backendPath
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}
npm install

# Step 5: Clean and reinstall mobile app dependencies
Write-Host "📱 Setting up Mobile App..." -ForegroundColor Cyan
Set-Location $mobilePath
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}
if (Test-Path ".expo") {
    Remove-Item ".expo" -Recurse -Force
}
npm install

# Step 6: Setup database (if MongoDB is running)
Write-Host "🗄️ Setting up database..." -ForegroundColor Cyan
Set-Location $rootPath
if (Test-Command "mongod") {
    Write-Host "MongoDB found, setting up database..." -ForegroundColor Green
    node setup-database.js
} else {
    Write-Host "⚠️ MongoDB not found. Please install MongoDB and run 'node setup-database.js' manually." -ForegroundColor Yellow
}

# Step 7: Start the backend server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Set-Location $backendPath
Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Step 8: Start the mobile app
Write-Host "📱 Starting Mobile App..." -ForegroundColor Green
Set-Location $mobilePath
Start-Process powershell -ArgumentList "-Command", "npx expo start --clear" -WindowStyle Normal

Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host "🌐 Backend should be running on: http://gate-pass-system-9vid.onrender.com" -ForegroundColor Cyan
Write-Host "📱 Mobile app should be starting with Expo..." -ForegroundColor Cyan
Write-Host "📝 Check the new PowerShell windows for logs" -ForegroundColor Yellow

# Display next steps
Write-Host "`n📋 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Wait for both servers to fully start" -ForegroundColor White
Write-Host "2. Scan QR code with Expo Go app on your phone" -ForegroundColor White
Write-Host "3. Or press 'w' to open in web browser" -ForegroundColor White
Write-Host "4. Test login with: student@example.com / password123" -ForegroundColor White

Write-Host "`n🐛 If you still have issues:" -ForegroundColor Red
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Check your network firewall settings" -ForegroundColor White
Write-Host "3. Verify your computer's IP address" -ForegroundColor White

Set-Location $rootPath