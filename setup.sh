#!/bin/bash

echo "================================"
echo "WindChat Setup Script"
echo "================================"
echo ""

echo "[1/4] Setting up backend..."
cd backend
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOL
PORT=3001
FRONTEND_URL=http://localhost:5173
EOL
fi
echo "Installing backend dependencies..."
npm install
cd ..

echo ""
echo "[2/4] Setting up frontend..."
cd frontend
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOL
VITE_SOCKET_URL=http://localhost:3001
EOL
fi
echo "Installing frontend dependencies..."
npm install
cd ..

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start the application:"
echo "  1. Open a terminal and run: cd backend && npm run dev"
echo "  2. Open another terminal and run: cd frontend && npm run dev"
echo "  3. Open your browser at http://localhost:5173"
echo ""
echo "For more information, see README.md and SETUP.md"
echo ""
