# HeronPanel Setup Script
Write-Host "?? Initializing HeronPanel Setup..." -ForegroundColor Cyan

# 1. Backend Dependencies
Write-Host "Installing Backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
npx prisma generate
cd ..

# 2. Frontend Dependencies
Write-Host "Installing Frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

# 3. Daemon
Write-Host "Checking Go installation..." -ForegroundColor Yellow
go version

Write-Host "?? Setup Complete! To start the project:" -ForegroundColor Green
Write-Host "Backend: cd backend; npm run dev"
Write-Host "Frontend: cd frontend; npm run dev"
Write-Host "Daemon: cd daemon; go run main.go"
