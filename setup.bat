@echo off
REM Project Management Web App - Installation Script (Windows)
REM This script automates the setup process

echo.
echo ================================================
echo Project Management Web App Setup
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

REM Navigate to backend
echo Installing backend dependencies...
cd backend

REM Install dependencies
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Create .env file in backend folder
echo 2. Add MongoDB URI and JWT secret
echo 3. Start server: npm start
echo 4. Open frontend\index.html in browser
echo.
echo For detailed instructions, see:
echo   - QUICKSTART.md (5-minute setup)
echo   - SETUP.md (comprehensive guide)
echo   - PROJECT_SUMMARY.md (project overview)
echo.
pause
