# RamSetu Health Bridge - Quick Deploy Script for Windows PowerShell

Write-Host "🚀 RamSetu Health Bridge Deployment Script" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if Vercel CLI is installed
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green

# Get the project root
$PROJECT_ROOT = "c:\Users\ACER\OneDrive\Desktop\RAMSETU_ORGAN_DONAR\DBMS\ramsetu-health-bridge-main"
$ADMIN_ROOT = "$PROJECT_ROOT\Admin\admin-frontend"

# Function to deploy a project
function Deploy-Project {
    param(
        [string]$ProjectPath,
        [string]$ProjectName
    )
    
    Write-Host "📦 Deploying $ProjectName..." -ForegroundColor Yellow
    Write-Host "Path: $ProjectPath" -ForegroundColor Gray
    
    if (-not (Test-Path $ProjectPath)) {
        Write-Host "❌ Project path not found: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $ProjectPath
    
    try {
        # Check if package.json exists
        if (-not (Test-Path "package.json")) {
            Write-Host "❌ No package.json found in $ProjectPath" -ForegroundColor Red
            return $false
        }
        
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            return $false
        }
        
        Write-Host "Building project..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed" -ForegroundColor Red
            return $false
        }
        
        Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
        vercel --prod
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Deployment failed" -ForegroundColor Red
            return $false
        }
        
        Write-Host "✅ $ProjectName deployed successfully!" -ForegroundColor Green
        return $true
    }
    finally {
        Pop-Location
    }
}

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Yellow
vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel login failed" -ForegroundColor Red
    exit 1
}

# Deploy main frontend
$mainSuccess = Deploy-Project -ProjectPath $PROJECT_ROOT -ProjectName "Main Frontend"

# Deploy admin frontend  
$adminSuccess = Deploy-Project -ProjectPath $ADMIN_ROOT -ProjectName "Admin Frontend"

# Summary
Write-Host "`n🎯 Deployment Summary" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "Main Frontend: $(if($mainSuccess){'✅ Success'}else{'❌ Failed'})" -ForegroundColor $(if($mainSuccess){'Green'}else{'Red'})
Write-Host "Admin Frontend: $(if($adminSuccess){'✅ Success'}else{'❌ Failed'})" -ForegroundColor $(if($adminSuccess){'Green'}else{'Red'})

if ($mainSuccess -and $adminSuccess) {
    Write-Host "`n🎉 All deployments successful!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy your backend to Render/Railway" -ForegroundColor White
    Write-Host "2. Update environment variables with your backend URL" -ForegroundColor White
    Write-Host "3. Update CORS in backend with your Vercel URLs" -ForegroundColor White
    Write-Host "4. Test your applications" -ForegroundColor White
    Write-Host "`nSee DEPLOYMENT_GUIDE.md for detailed instructions." -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some deployments failed. Check the errors above." -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")