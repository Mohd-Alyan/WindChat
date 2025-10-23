# WindChat Backend

Backend server for WindChat - Global Anonymous Chat Application.

## Features

- Real-time messaging with Socket.IO
- End-to-end encryption support
- Room management (max 10 users per room)
- Hidden admin privileges
- Auto-deletion of empty rooms
- Typing indicators

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. Run development server:
```bash
npm run dev
```

## Deployment (Fly.io)

1. Install Fly CLI
2. Login: `fly auth login`
3. Deploy: `fly deploy`

## API Endpoints

- `GET /health` - Health check endpoint

## Socket Events

### Client to Server
- `join-room` - Join or create a room
- `send-message` - Send encrypted message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `admin-remove-user` - Admin removes a user
- `admin-delete-room` - Admin deletes room

### Server to Client
- `room-joined` - Successfully joined room
- `user-joined` - New user joined
- `user-left` - User left room
- `receive-message` - New message received
- `user-typing` - User typing status
- `removed-from-room` - User was removed by admin
- `room-deleted` - Room deleted by admin
- `promoted-to-admin` - User promoted to admin
- `error` - Error message
