@echo off
echo ================================
echo WindChat Setup Script
echo ================================
echo.

echo [1/4] Setting up backend...
cd backend
if not exist .env (
    echo Creating backend .env file...
    echo PORT=3001> .env
    echo FRONTEND_URL=http://localhost:5173>> .env
)
echo Installing backend dependencies...
call npm install
cd ..

echo.
echo [2/4] Setting up frontend...
cd frontend
if not exist .env (
    echo Creating frontend .env file...
    echo VITE_SOCKET_URL=http://localhost:3001> .env
)
echo Installing frontend dependencies...
call npm install
cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo   1. Open a terminal and run: cd backend ^&^& npm run dev
echo   2. Open another terminal and run: cd frontend ^&^& npm run dev
echo   3. Open your browser at http://localhost:5173
echo.
echo For more information, see README.md and SETUP.md
echo.
pause
