@echo off
setlocal

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=normal

echo 🚀 Deploying Shiv Admin Backend...
echo Build type: %BUILD_TYPE%

REM Build locally
echo 📦 Building application locally...
if "%BUILD_TYPE%"=="standalone" (
    call npm run build:standalone
    set BUNDLE_FILE=server.standalone.js
    set DOCKERFILE=Dockerfile.standalone
) else if "%BUILD_TYPE%"=="obf" (
    call npm run build:standalone:obf
    set BUNDLE_FILE=server.standalone.obf.js
    set DOCKERFILE=Dockerfile.standalone.obf
) else (
    call npm run build
    set BUNDLE_FILE=server.bundle.js
    set DOCKERFILE=Dockerfile.webpack
)

REM Check if build was successful
if not exist "dist\%BUNDLE_FILE%" (
    echo ❌ Build failed! Bundle file not found.
    exit /b 1
)

echo  Build successful!

REM Create deployment package
echo 📦 Creating deployment package...
if exist deploy rmdir /s /q deploy
mkdir deploy
copy "dist\%BUNDLE_FILE%" deploy\
copy "%DOCKERFILE%" deploy\
copy ".env.example" deploy\

if not "%BUILD_TYPE%"=="standalone" (
    copy "package.json" deploy\
)

REM Create archive (requires 7zip or similar)
echo 📤 Creating deployment archive...
if exist "C:\Program Files\7-Zip\7z.exe" (
    "C:\Program Files\7-Zip\7z.exe" a deploy.zip deploy\*
    echo  Deployment package created: deploy.zip
) else (
    echo ⚠️  7-Zip not found. Please manually zip the deploy folder.
)

echo 📋 Next steps:
echo    1. Copy deploy.zip to your server
echo    2. Extract the files
echo    3. Build image: docker build -f %DOCKERFILE% -t shiv-admin-backend .
echo    4. Run container with your .env file

REM Cleanup
rmdir /s /q deploy
if exist deploy.zip echo 🎉 Ready for deployment!
