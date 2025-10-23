# WindChat Quick Start Guide 🚀

Get WindChat running in 5 minutes!

## Prerequisites

Make sure you have installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

Check your installation:
```bash
node --version
npm --version
```

## Option 1: Automated Setup (Recommended)

### Windows

1. Open Command Prompt or PowerShell in the WindChat folder
2. Run the setup script:
```cmd
setup.bat
```

### macOS/Linux

1. Open Terminal in the WindChat folder
2. Make the script executable and run it:
```bash
chmod +x setup.sh
./setup.sh
```

The script will automatically:
- Create environment files
- Install all dependencies
- Prepare both frontend and backend

## Option 2: Manual Setup

### Step 1: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
echo PORT=3001 > .env
echo FRONTEND_URL=http://localhost:5173 >> .env
```

### Step 2: Setup Frontend

```bash
# Navigate to frontend folder (from root)
cd frontend

# Install dependencies
npm install

# Create environment file
echo VITE_SOCKET_URL=http://localhost:3001 > .env
```

## Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ WindChat server running on port 3001
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

## Open the App

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the WindChat landing page! 🎉

## Testing Multi-User Chat

1. Keep the first browser window open
2. Enter your name and a room key (e.g., "test123")
3. Click "Join Chat"
4. Open a **new incognito/private window**
5. Go to http://localhost:5173
6. Enter a different name but the **same room key** ("test123")
7. Click "Join Chat"
8. Start chatting! 💬

## Features to Test

✅ **Basic Messaging**
- Type and send messages
- Messages appear in real-time

✅ **Typing Indicators**
- Start typing - see "typing..." indicator
- Check the user list for typing status

✅ **End-to-End Encryption**
- All messages are automatically encrypted
- Check browser console for encryption logs

✅ **Admin Features** (first user in room)
- Crown icon appears in header
- Hover over users to see remove button
- "Delete Room" button in header

✅ **Room Key**
- Click copy button to copy room key
- Share with others to join same room

✅ **Multiple Rooms**
- Use different room keys
- Each room is isolated with unique encryption

## Stopping the Application

Press `Ctrl + C` in both terminal windows to stop the servers.

## Common Issues & Solutions

### Issue: Port 3001 already in use

**Solution (Windows):**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Solution (macOS/Linux):**
```bash
lsof -ti:3001 | xargs kill -9
```

### Issue: Cannot connect to backend

**Check:**
1. Backend is running (Terminal 1)
2. No firewall blocking port 3001
3. `.env` files are correct

### Issue: Build errors

**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Page shows blank

**Check:**
1. Frontend is running (Terminal 2)
2. Browser console for errors (F12)
3. Try clearing browser cache

## Project Structure

```
windchat/
├── backend/              # Node.js + Express + Socket.IO
│   ├── server.js        # Main server file
│   ├── package.json     # Dependencies
│   └── .env            # Configuration (you create this)
│
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/      # Encryption & Socket utilities
│   │   ├── App.jsx     # Root component
│   │   └── main.jsx    # Entry point
│   ├── package.json    # Dependencies
│   └── .env           # Configuration (you create this)
│
├── README.md           # Main documentation
├── SETUP.md           # Detailed setup guide
└── DEPLOYMENT.md      # Production deployment guide
```

## What's Next?

### Learn More
- Read [README.md](README.md) for full documentation
- Check [SETUP.md](SETUP.md) for detailed setup
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

### Customize
- Modify UI in `frontend/src/components/`
- Add features to `backend/server.js`
- Adjust styling in `frontend/src/index.css`

### Deploy
- Deploy backend to [Fly.io](https://fly.io)
- Deploy frontend to [Vercel](https://vercel.com)
- Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## Key Features Implemented

✅ End-to-end encryption (Web Crypto API)
✅ Real-time messaging (Socket.IO)
✅ Room-based chat (shared keys)
✅ User limit (10 per room)
✅ Hidden admin privileges
✅ Auto-delete empty rooms
✅ Typing indicators
✅ Modern UI (Tailwind CSS)
✅ AI-generated backgrounds
✅ Mobile responsive
✅ Cross-browser compatible

## Need Help?

- Check the [README.md](README.md)
- Review [SETUP.md](SETUP.md) for troubleshooting
- Check browser console (F12) for errors
- Verify both servers are running

## Security Notes

🔒 Messages are encrypted end-to-end
🔒 Server never sees plaintext
🔒 Rooms auto-delete when empty
🔒 No data persistence
🔒 Anonymous by default

## Performance Tips

- Messages are in-memory only
- Rooms cleanup automatically
- Typing has 2-second debounce
- Backgrounds are cached

---

**You're all set! Enjoy building with WindChat! 💬**

For questions or issues, refer to the main README.md or open an issue on GitHub.
