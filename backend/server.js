const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - support multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '')))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Room data structure: { roomKey: { users: Map, admin: socketId, background: url, createdAt: timestamp } }
const chatRooms = new Map();

// Maximum users per room
const MAX_USERS_PER_ROOM = 10;

// Generate consistent background for each room
function getRoomBackground(roomKey) {
  // Use a deterministic approach based on room key
  const backgrounds = [
    'https://images.unsplash.com/photo-1557683316-973673baf926',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986',
    'https://images.unsplash.com/photo-1464802686167-b939a6910659',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a'
  ];
  
  // Generate hash from room key
  let hash = 0;
  for (let i = 0; i < roomKey.length; i++) {
    hash = ((hash << 5) - hash) + roomKey.charCodeAt(i);
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % backgrounds.length;
  return backgrounds[index] + '?w=1920&q=80&fit=crop';
}

// Clean up empty rooms
function cleanupRoom(roomKey) {
  const room = chatRooms.get(roomKey);
  if (room && room.users.size === 0) {
    chatRooms.delete(roomKey);
    console.log(`Room ${roomKey} deleted - no users remaining`);
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room
  socket.on('join-room', ({ roomKey, username }) => {
    try {
      // Validate input
      if (!roomKey || !username) {
        socket.emit('error', { message: 'Room key and username are required' });
        return;
      }

      // Check if room exists
      let room = chatRooms.get(roomKey);
      
      if (room) {
        // Check if room is full
        if (room.users.size >= MAX_USERS_PER_ROOM) {
          socket.emit('error', { message: 'Room is full (max 10 users)' });
          return;
        }
      } else {
        // Create new room
        room = {
          users: new Map(),
          admin: socket.id,
          background: getRoomBackground(roomKey),
          createdAt: Date.now()
        };
        chatRooms.set(roomKey, room);
        console.log(`Room ${roomKey} created by ${socket.id}`);
      }

      // Add user to room
      room.users.set(socket.id, {
        username,
        socketId: socket.id,
        isTyping: false
      });

      // Join socket room
      socket.join(roomKey);
      socket.roomKey = roomKey;
      socket.username = username;

      // Send room info to user
      socket.emit('room-joined', {
        roomKey,
        background: room.background,
        isAdmin: room.admin === socket.id,
        users: Array.from(room.users.values()).map(u => ({
          socketId: u.socketId,
          username: u.username,
          isTyping: u.isTyping
        }))
      });

      // Notify other users
      socket.to(roomKey).emit('user-joined', {
        socketId: socket.id,
        username
      });

      console.log(`${username} joined room ${roomKey}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle message
  socket.on('send-message', ({ roomKey, encryptedMessage, timestamp }) => {
    const room = chatRooms.get(roomKey);
    if (!room || !room.users.has(socket.id)) {
      socket.emit('error', { message: 'Not in room' });
      return;
    }

    // Broadcast encrypted message to all users in room
    io.to(roomKey).emit('receive-message', {
      socketId: socket.id,
      username: socket.username,
      encryptedMessage,
      timestamp
    });
  });

  // Handle typing status
  socket.on('typing-start', ({ roomKey }) => {
    const room = chatRooms.get(roomKey);
    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id);
      user.isTyping = true;
      
      // Notify others
      socket.to(roomKey).emit('user-typing', {
        socketId: socket.id,
        username: socket.username,
        isTyping: true
      });
    }
  });

  socket.on('typing-stop', ({ roomKey }) => {
    const room = chatRooms.get(roomKey);
    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id);
      user.isTyping = false;
      
      // Notify others
      socket.to(roomKey).emit('user-typing', {
        socketId: socket.id,
        username: socket.username,
        isTyping: false
      });
    }
  });

  // Admin: Remove user
  socket.on('admin-remove-user', ({ roomKey, targetSocketId }) => {
    const room = chatRooms.get(roomKey);
    if (!room || room.admin !== socket.id) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Find target socket
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      // Notify user they were removed
      targetSocket.emit('removed-from-room', { roomKey });
      
      // Remove from room
      targetSocket.leave(roomKey);
      room.users.delete(targetSocketId);
      
      // Notify others
      io.to(roomKey).emit('user-left', {
        socketId: targetSocketId,
        username: room.users.get(targetSocketId)?.username || 'Unknown'
      });

      console.log(`Admin removed user ${targetSocketId} from room ${roomKey}`);
      
      // Cleanup if empty
      cleanupRoom(roomKey);
    }
  });

  // Admin: Delete room
  socket.on('admin-delete-room', ({ roomKey }) => {
    const room = chatRooms.get(roomKey);
    if (!room || room.admin !== socket.id) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // Notify all users
    io.to(roomKey).emit('room-deleted', { roomKey });

    // Remove all users
    room.users.forEach((user, socketId) => {
      const userSocket = io.sockets.sockets.get(socketId);
      if (userSocket) {
        userSocket.leave(roomKey);
      }
    });

    // Delete room
    chatRooms.delete(roomKey);
    console.log(`Admin deleted room ${roomKey}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const roomKey = socket.roomKey;
    if (roomKey) {
      const room = chatRooms.get(roomKey);
      if (room) {
        const username = socket.username;
        room.users.delete(socket.id);

        // Notify others
        socket.to(roomKey).emit('user-left', {
          socketId: socket.id,
          username
        });

        console.log(`${username} left room ${roomKey}`);

        // If admin left, assign new admin
        if (room.admin === socket.id && room.users.size > 0) {
          const newAdmin = room.users.keys().next().value;
          room.admin = newAdmin;
          
          // Notify new admin
          const newAdminSocket = io.sockets.sockets.get(newAdmin);
          if (newAdminSocket) {
            newAdminSocket.emit('promoted-to-admin', { roomKey });
          }
          
          console.log(`New admin for room ${roomKey}: ${newAdmin}`);
        }

        // Cleanup empty room
        cleanupRoom(roomKey);
      }
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WindChat API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      websocket: 'Socket.IO connection available'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: chatRooms.size,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WindChat server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
