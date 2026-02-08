@echo off
REM ====================================================
REM QUICK START SCRIPT - USER PERMISSION TESTING
REM ====================================================

echo.
echo ========================================
echo   USER PERMISSION SYSTEM - QUICK START
echo ========================================
echo.

REM Check if .NET is installed
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] .NET SDK not found! Please install .NET 10 SDK
    pause
    exit /b 1
)

echo [1/5] Building solution...
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Checking database...
dotnet ef database update -p src/CLEAN-Pl.Infrastructure -s src/CLEAN-Pl.API --no-build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database update failed. You may need to check connection string.
    pause
)

echo.
echo [3/5] Starting API...
echo.
echo ========================================
echo   API will start in a moment...
echo   Swagger UI: https://localhost:7099/swagger
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start API
dotnet run --project src/CLEAN-Pl.API --no-build

pause
