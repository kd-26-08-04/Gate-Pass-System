# SDK Version Fix Script for Gate Pass System
Write-Host "🔧 Fixing SDK version issues..." -ForegroundColor Green

$rootPath = "k:\Project for SALE\Gate pass System"
$mobilePath = "$rootPath\mobile-app"
$backendPath = "$rootPath\Backend"

# Function to check if a command exists
function Test-Command($command) {
    return Get-Command $command -ErrorAction SilentlyContinue
}

# Step 1: Kill existing processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "expo" -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 2: Clean npm cache
Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 3: Update global packages
Write-Host "📦 Updating global packages..." -ForegroundColor Yellow
npm install -g @expo/cli@latest
npm install -g expo-cli@latest

# Step 4: Fix mobile app dependencies
Write-Host "📱 Fixing mobile app SDK versions..." -ForegroundColor Cyan
Set-Location $mobilePath

# Remove problematic files
if (Test-Path "node_modules") {
    Write-Host "Removing old node_modules..." -ForegroundColor Yellow
    Remove-Item "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -Force
}
if (Test-Path ".expo") {
    Write-Host "Removing .expo cache..." -ForegroundColor Yellow
    Remove-Item ".expo" -Recurse -Force
}

# Install dependencies with correct versions
Write-Host "Installing dependencies with correct SDK versions..." -ForegroundColor Green
npm install

# Step 5: Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Cyan
$npmList = npm ls --depth=0 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some dependency issues detected:" -ForegroundColor Yellow
    Write-Host $npmList -ForegroundColor Red
}

# Step 6: Check backend
Write-Host "🔧 Checking backend..." -ForegroundColor Cyan
Set-Location $backendPath
npm install

Write-Host "✅ SDK fixes completed!" -ForegroundColor Green
Write-Host "📋 Summary of fixes:" -ForegroundColor Magenta
Write-Host "- Updated React to 19.0.0 (compatible with React Native 0.79.5)" -ForegroundColor White
Write-Host "- Ensured React Native 0.79.5 compatibility with Expo SDK 53" -ForegroundColor White
Write-Host "- Cleaned and reinstalled all dependencies" -ForegroundColor White
Write-Host "- Updated global Expo CLI tools" -ForegroundColor White

Write-Host "`n🚀 Next steps:" -ForegroundColor Green
Write-Host "1. Run: cd '$mobilePath' && npx expo start --clear" -ForegroundColor White
Write-Host "2. Run: cd '$backendPath' && npm run dev" -ForegroundColor White

Set-Location $rootPath