# WindChat Frontend

Modern, responsive frontend for WindChat - Anonymous Global Chat Application.

## Features

- Beautiful, modern UI with Tailwind CSS
- Real-time messaging with Socket.IO
- End-to-end encryption with Web Crypto API
- Responsive design (mobile-friendly)
- AI-generated chat backgrounds
- Typing indicators
- User list sidebar
- Admin controls (hidden UI)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```
VITE_SOCKET_URL=http://localhost:3001
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SOCKET_URL`: Your backend URL (e.g., https://your-backend.fly.dev)

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx    # Entry page with room join form
│   └── ChatRoom.jsx        # Main chat interface
├── utils/
│   ├── encryption.js       # E2E encryption utilities
│   └── socket.js           # Socket.IO client setup
├── App.jsx                 # Root component
├── main.jsx               # Entry point
└── index.css              # Global styles with Tailwind
```

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **Web Crypto API** - End-to-end encryption

## Environment Variables

- `VITE_SOCKET_URL` - Backend WebSocket server URL

## Browser Requirements

- Modern browsers with Web Crypto API support
- Chrome 60+, Firefox 58+, Safari 11+, Edge 79+
