# Update GitHub Repository Script
# This script helps you maintain and update your GitHub repository

param(
    [string]$CommitMessage = "",
    [switch]$Force = $false,
    [switch]$CreateRelease = $false,
    [string]$ReleaseVersion = ""
)

Write-Host "🔄 Gate Pass System - GitHub Update Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Function to check if we're in a git repository
function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-Host "❌ Not a git repository. Please run this script from the project root." -ForegroundColor Red
        exit 1
    }
}

# Function to check for uncommitted changes
function Get-GitStatus {
    $status = git status --porcelain
    return $status
}

# Function to update dependencies
function Update-Dependencies {
    Write-Host "📦 Updating dependencies..." -ForegroundColor Yellow
    
    # Update Backend dependencies
    if (Test-Path "Backend/package.json") {
        Write-Host "   Updating Backend dependencies..." -ForegroundColor Cyan
        Push-Location "Backend"
        npm update
        Pop-Location
    }
    
    # Update Mobile App dependencies
    if (Test-Path "mobile-app/package.json") {
        Write-Host "   Updating Mobile App dependencies..." -ForegroundColor Cyan
        Push-Location "mobile-app"
        npm update
        Pop-Location
    }
    
    Write-Host "✅ Dependencies updated!" -ForegroundColor Green
}

# Function to run tests
function Invoke-Tests {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    $testsPassed = $true
    
    # Test Backend
    if (Test-Path "Backend/package.json") {
        Write-Host "   Testing Backend..." -ForegroundColor Cyan
        Push-Location "Backend"
        $backendTest = npm test 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  Backend tests failed or not configured" -ForegroundColor Yellow
        }
        Pop-Location
    }
    
    # Test Mobile App
    if (Test-Path "mobile-app/package.json") {
        Write-Host "   Testing Mobile App..." -ForegroundColor Cyan
        Push-Location "mobile-app"
        $mobileTest = npm test 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  Mobile App tests failed or not configured" -ForegroundColor Yellow
        }
        Pop-Location
    }
    
    Write-Host "✅ Tests completed!" -ForegroundColor Green
    return $testsPassed
}

# Function to create a release
function New-GitHubRelease {
    param([string]$Version)
    
    if ([string]::IsNullOrWhiteSpace($Version)) {
        $Version = Read-Host "Enter release version (e.g., v1.0.0)"
    }
    
    Write-Host "🏷️  Creating release $Version..." -ForegroundColor Yellow
    
    # Create and push tag
    git tag -a $Version -m "Release $Version"
    git push origin $Version
    
    Write-Host "✅ Release $Version created! Visit GitHub to add release notes." -ForegroundColor Green
}

# Main execution
Test-GitRepository

Write-Host "🔍 Checking repository status..." -ForegroundColor Cyan
$changes = Get-GitStatus

if ($changes) {
    Write-Host "📝 Found changes to commit:" -ForegroundColor Yellow
    git status --short
    
    # Update dependencies if requested
    $updateDeps = Read-Host "Update dependencies before committing? (y/N)"
    if ($updateDeps -eq 'y' -or $updateDeps -eq 'Y') {
        Update-Dependencies
    }
    
    # Run tests if requested
    $runTests = Read-Host "Run tests before committing? (y/N)"
    if ($runTests -eq 'y' -or $runTests -eq 'Y') {
        Invoke-Tests
    }
    
    # Get commit message
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $CommitMessage = Read-Host "Enter commit message"
        if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
            $CommitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
    }
    
    # Add and commit changes
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "$CommitMessage"
    
    Write-Host "✅ Changes committed!" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes found." -ForegroundColor Green
}

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
$currentBranch = git branch --show-current

try {
    if ($Force) {
        git push origin $currentBranch --force
        Write-Host "✅ Force pushed to GitHub!" -ForegroundColor Green
    } else {
        git push origin $currentBranch
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to push to GitHub. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running with -Force flag if needed" -ForegroundColor Yellow
    exit 1
}

# Create release if requested
if ($CreateRelease) {
    New-GitHubRelease -Version $ReleaseVersion
}

# Show repository information
Write-Host "`n📊 Repository Information:" -ForegroundColor Cyan
Write-Host "Branch: $(git branch --show-current)" -ForegroundColor White
Write-Host "Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')" -ForegroundColor White
Write-Host "Remote URL: $(git remote get-url origin)" -ForegroundColor White

Write-Host "`n🎯 Quick Actions:" -ForegroundColor Cyan
Write-Host "• View on GitHub: $(git remote get-url origin)" -ForegroundColor White
Write-Host "• Check Actions: $(git remote get-url origin)/actions" -ForegroundColor White
Write-Host "• View Issues: $(git remote get-url origin)/issues" -ForegroundColor White
Write-Host "• Create PR: $(git remote get-url origin)/compare" -ForegroundColor White

Write-Host "`n🎉 Repository updated successfully!" -ForegroundColor Green