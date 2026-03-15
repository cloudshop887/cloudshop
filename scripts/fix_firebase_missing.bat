@echo off
echo Installing Firebase for Frontend...
cd ..\frontend
call npm install firebase
echo.
echo Firebase installed successfully!
echo Please restart your frontend server (Ctrl+C, then npm run dev)
pause
