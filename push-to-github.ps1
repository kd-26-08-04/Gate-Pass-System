# Push to GitHub Script
# This script helps you push your Gate Pass System to GitHub

Write-Host "🚀 Gate Pass System - GitHub Push Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Found uncommitted changes. Adding and committing..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Prompt for commit message
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    # Commit changes
    git commit -m "$commitMessage"
    Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes found." -ForegroundColor Green
}

# Check if remote origin exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "❌ No 'origin' remote found." -ForegroundColor Red
    Write-Host "Please add your GitHub repository as origin:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/yourusername/your-repo-name.git" -ForegroundColor Cyan
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current

Write-Host "🌿 Current branch: $currentBranch" -ForegroundColor Cyan

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin $currentBranch
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Your repository is now available on GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running: git push -u origin $currentBranch --force" -ForegroundColor Yellow
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Visit your GitHub repository to verify the push" -ForegroundColor White
Write-Host "2. Add a description and topics to your repository" -ForegroundColor White
Write-Host "3. Consider adding GitHub Actions for CI/CD" -ForegroundColor White
Write-Host "4. Add collaborators if working in a team" -ForegroundColor White

Write-Host "`n🎉 Gate Pass System is now on GitHub!" -ForegroundColor Green