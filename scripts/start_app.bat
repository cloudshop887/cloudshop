@echo off
echo Starting CloudShop Application...
echo.

echo Starting Backend...
start "CloudShop Backend" cmd /k "cd ..\backend && npm run dev"

echo Starting Frontend...
start "CloudShop Frontend" cmd /k "cd ..\frontend && npm run dev"

echo.
echo Application started! 
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
pause
