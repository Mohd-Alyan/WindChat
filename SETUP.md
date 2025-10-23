# WindChat Setup Guide

This guide will help you set up WindChat for local development.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env and configure
PORT=3001
FRONTEND_URL=http://localhost:5173

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env and configure
VITE_SOCKET_URL=http://localhost:3001

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Testing

1. Open your browser at `http://localhost:5173`
2. Enter a username and room key
3. Open another browser window (or incognito) with the same room key
4. Start chatting!

## Production Deployment

### Backend (Fly.io)

1. Install Fly CLI:
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

2. Login and deploy:
```bash
cd backend
fly auth login
fly launch
fly deploy
```

3. Set production environment variables:
```bash
fly secrets set FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `VITE_SOCKET_URL` = `https://your-backend.fly.dev`

## Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Kill process on port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

**CORS errors**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Frontend Issues

**Cannot connect to backend**
- Verify backend is running
- Check `VITE_SOCKET_URL` in frontend `.env`
- Ensure no firewall blocking port 3001

**Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Multiple Users**: Open multiple browser windows to test multi-user features
3. **Admin Testing**: First user to join a room becomes admin
4. **Encryption**: Messages are encrypted end-to-end; check browser console for encryption logs

## Architecture Overview

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │◄──────────────────────────►│                  │
│  React Frontend │                            │  Express Backend │
│  (Port 5173)    │         Socket.IO          │  (Port 3001)     │
│                 │                            │                  │
└─────────────────┘                            └──────────────────┘
        │                                              │
        │                                              │
   Web Crypto API                              Room Management
   (E2E Encryption)                            (Max 10 users)
```

## Security Notes

- Messages are encrypted on the client before sending
- Server never sees plaintext messages
- Room keys should be shared securely
- Rooms auto-delete when empty
- Admin privileges are hidden from other users

## Performance Optimization

- Messages are kept in memory only
- Rooms with no users are immediately deleted
- Background images are cached
- Typing indicators have debounce (2 seconds)

## Browser Compatibility

- Chrome 60+
- Firefox 58+
- Safari 11+
- Edge 79+

Web Crypto API is required for encryption.

## Need Help?

- Check the main README.md
- Review the code documentation
- Open an issue on GitHub

Happy chatting! 💬
