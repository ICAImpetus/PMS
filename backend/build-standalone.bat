@echo off
setlocal

set MODE=%1
if "%MODE%"=="" set MODE=normal

echo 🚀 Building Standalone Shiv Admin Backend (mode: %MODE%)...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Build standalone bundle (normal or obfuscated)
if /I "%MODE%"=="obf" (
    echo � Building OBFUSCATED standalone bundle...
    call npm run build:standalone:obf
    set BUNDLE=server.standalone.obf.js
    set DOCKERFILE=Dockerfile.standalone.obf
) else (
    echo �🔨 Building standalone bundle...
    call npm run build:standalone
    set BUNDLE=server.standalone.js
    set DOCKERFILE=Dockerfile.standalone
)

REM Check if build was successful
if not exist "dist\%BUNDLE%" (
        echo ❌ Build failed! Bundle file not found: dist\%BUNDLE%
        exit /b 1
)

echo  Build successful!

REM Copy environment file to dist
echo 📋 Copying environment configuration...
if exist ".env" (
        copy ".env" "dist\" >nul
        echo  Environment file copied to dist/
) else (
        echo ⚠️  Warning: .env file not found. Create one with your MongoDB settings.
)

REM Also copy Docker-specific env file
if exist ".env.docker" (
        copy ".env.docker" "dist\" >nul
        echo  Docker environment file copied to dist/
)

REM Show bundle info
echo 📊 Bundle information:
for %%I in (dist\%BUNDLE%) do echo    Size: %%~zI bytes
echo    Location: dist\%BUNDLE%

echo 🚀 Ready for deployment!
echo.
echo 📋 Next steps:
echo    1. Test locally: node dist\%BUNDLE%
echo    2. Copy entire dist/ folder to server
echo    3. On server: node %BUNDLE%
echo.
echo 🐳 Docker deployment:
echo    1. Copy dist/ folder to server
echo    2. cd dist
echo    3. For Docker: docker build -f %DOCKERFILE% -t shiv-admin-backend .
echo    4. Run with host network: docker run -d --network="host" --env-file .env shiv-admin-backend
echo    5. OR run with Docker env: docker run -d -p 5000:5000 --env-file .env.docker shiv-admin-backend

pause
