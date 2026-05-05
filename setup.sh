#!/bin/bash

# Project Management Web App - Installation Script (Linux/macOS)
# This script automates the setup process

echo "================================================"
echo "Project Management Web App Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Navigate to backend
echo "📦 Installing backend dependencies..."
cd backend

# Install dependencies
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "================================================"
echo "Setup Complete! 🎉"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Create .env file in backend folder"
echo "2. Add MongoDB URI and JWT secret"
echo "3. Start server: npm start"
echo "4. Open frontend/index.html in browser"
echo ""
echo "For detailed instructions, see:"
echo "  - QUICKSTART.md (5-minute setup)"
echo "  - SETUP.md (comprehensive guide)"
echo "  - PROJECT_SUMMARY.md (project overview)"
echo ""
