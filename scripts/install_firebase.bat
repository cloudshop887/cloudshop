@echo off
echo ========================================
echo Installing Firebase Dependencies
echo ========================================
echo.

cd ..\frontend
echo Installing firebase...
call npm install firebase

cd ..\backend
echo.
echo Running Database Migration...
call npx prisma migrate dev --name add_firebase_uid

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get Firebase Config from https://console.firebase.google.com/
echo 2. Update frontend/src/config/firebase.js with your config
echo 3. Start your backend: npm run dev
echo 4. Start your frontend: cd ../frontend && npm run dev
echo.
pause
