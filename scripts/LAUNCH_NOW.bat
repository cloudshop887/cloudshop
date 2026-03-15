@echo off
echo ===========================================
echo      CloudShop Launcher
echo ===========================================
echo.
echo Starting Backend...
start "CloudShop Backend" cmd /k "cd ..\backend && npm run dev"
echo.
echo Starting Frontend...
start "CloudShop Frontend" cmd /k "cd ..\frontend && npm run dev"
echo.
echo Done! Please minimize these windows and go to http://localhost:5173
pause
