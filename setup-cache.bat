@echo off
echo 🚀 Setting up Riksdata cache system...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Install requirements
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Run setup script
echo 📥 Setting up cache system...
python scripts/setup-cache.py
if errorlevel 1 (
    echo ❌ Cache setup failed
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo 🌐 Your website will now use 100%% reliable cached data!
echo.
pause
