@echo off
echo ========================================
echo Installing Google OAuth Dependencies
echo ========================================
echo.

cd ..\backend
echo Installing passport and passport-google-oauth20...
call npm install passport passport-google-oauth20

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get Google OAuth credentials from https://console.cloud.google.com/
echo 2. Update backend/.env with your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
echo 3. Run the database migration: npx prisma migrate dev --name add_google_oauth
echo 4. Start your backend: npm run dev
echo.
pause
