@echo off
echo 🚀 Building Shiv Admin UI Backend...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Run production build
echo 🔨 Building for production...
call npm run build

REM Check if build was successful
if exist "dist\server.bundle.js" (
    echo  Build successful!
    echo 📊 Bundle size:
    dir "dist\server.bundle.js"
    echo.
    echo 🚀 To run the bundled server:
    echo    npm run serve
    echo.
    echo 🐳 To build Docker image:
    echo    docker build -f Dockerfile.webpack -t shiv-admin-backend .
) else (
    echo ❌ Build failed!
    exit /b 1
)
