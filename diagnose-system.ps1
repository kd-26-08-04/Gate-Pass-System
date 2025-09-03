# System Diagnostic Script for Gate Pass System
Write-Host "🔍 Running system diagnostics..." -ForegroundColor Green

$rootPath = "k:\Project for SALE\Gate pass System"

# Check Node.js version
Write-Host "`n📋 Node.js Version Check:" -ForegroundColor Cyan
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
}

# Check npm version
Write-Host "`n📋 NPM Version Check:" -ForegroundColor Cyan
if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ NPM not found!" -ForegroundColor Red
}

# Check MongoDB status
Write-Host "`n📋 MongoDB Status:" -ForegroundColor Cyan
if (Get-Command "mongod" -ErrorAction SilentlyContinue) {
    Write-Host "✅ MongoDB CLI found" -ForegroundColor Green
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService) {
        Write-Host "✅ MongoDB Service: $($mongoService.Status)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB service not found (might be manual installation)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ MongoDB not found!" -ForegroundColor Red
}

# Check Expo CLI
Write-Host "`n📋 Expo CLI Status:" -ForegroundColor Cyan
if (Get-Command "expo" -ErrorAction SilentlyContinue) {
    $expoVersion = expo --version
    Write-Host "✅ Expo CLI: $expoVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Expo CLI not found!" -ForegroundColor Red
}

# Check project structure
Write-Host "`n📋 Project Structure:" -ForegroundColor Cyan
$requiredPaths = @(
    "$rootPath\Backend\package.json",
    "$rootPath\Backend\server.js",
    "$rootPath\mobile-app\package.json",
    "$rootPath\mobile-app\App.js",
    "$rootPath\mobile-app\assets\icon.png"
)

foreach ($path in $requiredPaths) {
    if (Test-Path $path) {
        Write-Host "✅ $path" -ForegroundColor Green
    } else {
        Write-Host "❌ $path" -ForegroundColor Red
    }
}

# Check network connectivity
Write-Host "`n📋 Network Connectivity:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://gate-pass-system-9vid.onrender.com" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server not responding" -ForegroundColor Red
}

# Check for common issues
Write-Host "`n📋 Common Issues Check:" -ForegroundColor Cyan

# Check if ports are in use
$ports = @(5000, 8081, 19000, 19001, 19002)
foreach ($port in $ports) {
    $netstat = netstat -an | Select-String ":$port "
    if ($netstat) {
        Write-Host "⚠️ Port $port is in use" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    }
}

# Check for conflicting processes
$processes = @("node", "npm", "expo", "mongod")
foreach ($process in $processes) {
    $runningProcesses = Get-Process -Name $process -ErrorAction SilentlyContinue
    if ($runningProcesses) {
        Write-Host "⚠️ $process processes running: $($runningProcesses.Count)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ No conflicting $process processes" -ForegroundColor Green
    }
}

# Check IP address for mobile device connection
Write-Host "`n📋 Network Configuration:" -ForegroundColor Cyan
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" }).IPAddress | Select-Object -First 1
if ($ipAddress) {
    Write-Host "✅ Your IP Address: $ipAddress" -ForegroundColor Green
    Write-Host "📱 Use this IP for mobile device testing" -ForegroundColor Cyan
} else {
    Write-Host "❌ Could not determine IP address" -ForegroundColor Red
}

Write-Host "`n🎯 Diagnostic Summary:" -ForegroundColor Magenta
Write-Host "Run this diagnostic before starting the application to identify issues." -ForegroundColor White