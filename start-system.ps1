# Complete System Startup Script
Write-Host "🚀 Starting Gate Pass System..." -ForegroundColor Green

$rootPath = "k:\Project for SALE\Gate pass System"
$mobilePath = "$rootPath\mobile-app"
$backendPath = "$rootPath\Backend"

# Function to check if a command exists
function Test-Command($command) {
    return Get-Command $command -ErrorAction SilentlyContinue
}

# Step 1: Verify system requirements
Write-Host "🔍 Checking system requirements..." -ForegroundColor Cyan

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ NPM not found!" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "🗄️ Checking MongoDB..." -ForegroundColor Cyan
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "✅ MongoDB service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB service not running. Please start MongoDB manually." -ForegroundColor Yellow
}

# Step 2: Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Cyan
Set-Location $rootPath
if (Test-Path "setup-database.js") {
    node setup-database.js
} else {
    Write-Host "⚠️ Database setup script not found" -ForegroundColor Yellow
}

# Step 3: Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Green
Set-Location $backendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 4: Start mobile app
Write-Host "📱 Starting mobile app..." -ForegroundColor Green
Set-Location $mobilePath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Mobile App Starting...' -ForegroundColor Green; npx expo start --clear" -WindowStyle Normal

# Step 5: Display information
Write-Host "`n✅ System startup initiated!" -ForegroundColor Green
Write-Host "📋 System Information:" -ForegroundColor Magenta
Write-Host "🌐 Backend URL: http://gate-pass-system-9vid.onrender.com" -ForegroundColor Cyan
Write-Host "📱 Mobile App: Starting with Expo..." -ForegroundColor Cyan

# Get IP address for mobile testing
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" }).IPAddress | Select-Object -First 1
if ($ipAddress) {
    Write-Host "📱 Your IP Address: $ipAddress" -ForegroundColor Green
    Write-Host "📱 Mobile devices should connect to this IP" -ForegroundColor Cyan
}

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for both servers to fully start (check the new PowerShell windows)" -ForegroundColor White
Write-Host "2. Install 'Expo Go' app on your mobile device" -ForegroundColor White
Write-Host "3. Scan the QR code with Expo Go app" -ForegroundColor White
Write-Host "4. Or press 'w' in the Expo terminal to open in web browser" -ForegroundColor White
Write-Host "5. Test login with: student@example.com / password123" -ForegroundColor White

Write-Host "`n🐛 If you encounter issues:" -ForegroundColor Red
Write-Host "1. Check that MongoDB is running" -ForegroundColor White
Write-Host "2. Ensure your firewall allows connections on ports 5000 and 8081" -ForegroundColor White
Write-Host "3. Make sure your mobile device is on the same network" -ForegroundColor White

Set-Location $rootPath
Write-Host "`n🎉 Gate Pass System is ready!" -ForegroundColor Green