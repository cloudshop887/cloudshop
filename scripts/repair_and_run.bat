@echo off
echo ===========================================
echo      CloudShop Repair & Launch Tool
echo ===========================================
echo.

echo 1. Installing Backend Dependencies...
cd ..\backend
call npm install
echo.

echo 2. Installing Frontend Dependencies...
cd ../frontend
call npm install
echo.

echo 3. Configuring Database...
cd ../backend
call npx prisma generate
echo.

echo ===========================================
echo      Starting Servers...
echo ===========================================
echo.
echo Starting Backend (Port 5000)...
start "CloudShop Backend" cmd /k "npm run dev"

timeout /t 5

echo Starting Frontend (Port 5173)...
cd ..\frontend
start "CloudShop Frontend" cmd /k "npm run dev"

echo.
echo ===========================================
echo      System is Live!
echo ===========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo NOTE: If Phone Login fails with "billing-not-enabled",
echo it means your Firebase project is on the Free (Spark) plan.
echo Google Phone Auth requires the Pay-as-you-go (Blaze) plan.
echo.
pause
