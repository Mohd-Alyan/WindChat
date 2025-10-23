# WindChat 💬

**WindChat** is a secure, anonymous chat application that allows users worldwide to communicate using shared keys. Built with privacy and simplicity in mind, it features end-to-end encryption and automatic room cleanup.

![WindChat](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔐 **End-to-End Encryption** - All messages encrypted using Web Crypto API
- 🎭 **Anonymous** - No registration, no tracking, complete privacy
- ⚡ **Real-time** - Instant messaging with Socket.IO
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- 👥 **Multi-user** - Up to 10 users per room
- 🔑 **Shared Key Access** - Simple room joining with shared keys
- 👑 **Hidden Admin** - Room creator has moderation powers
- 🗑️ **Auto-delete** - Rooms automatically deleted when empty
- 💬 **Typing Indicators** - See when others are typing
- 🖼️ **AI Backgrounds** - Unique background for each room

## 🏗️ Architecture

```
windchat/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   └── ChatRoom.jsx
│   │   ├── utils/
│   │   │   ├── encryption.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── backend/           # Node.js + Express + Socket.IO
    ├── server.js
    └── package.json
```

## 🔒 Security Model

- **End-to-End Encryption**: Messages are encrypted on the client using AES-GCM
- **Key Derivation**: Room keys are used to derive encryption keys via PBKDF2
- **No Storage**: No messages are stored server-side
- **Hidden Admin**: Admin privileges are server-side only, invisible to clients
- **Auto-cleanup**: Rooms and all data deleted when empty

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- Web Crypto API
- Lucide Icons

### Backend
- Node.js
- Express
- Socket.IO
- CORS

## 📖 User Flow

1. User opens the website
2. Enters name and room key (or generates one)
3. Joins chat room
4. Communicates securely with other users
5. Leaves room (auto-deleted when empty)

## 🎯 Room Lifecycle

1. **Creation** - Room created when first user joins
2. **Admin Assignment** - First user becomes admin (hidden)
3. **Active** - Up to 10 users can chat
4. **Cleanup** - Room deleted when last user leaves

## 👑 Admin Features

The room creator automatically receives hidden admin privileges:

- Remove/block users
- Delete the room
- Transfer admin rights (automatic on admin leave)

*Note: Admin status is invisible to other users*

## 🎨 UI Features

- Modern glassmorphism design
- Responsive (mobile-friendly)
- Dark theme
- Smooth animations
- AI-generated backgrounds per room
- Typing indicators in chat and user list
- Copy room key button
- Visual admin badge (only visible to admin)

## 🔮 Future Enhancements

- [ ] Optional message persistence (short duration)
- [ ] Vote-based room deletion
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Emoji/markdown support
- [ ] File sharing (encrypted)
- [ ] Voice messages
- [ ] Screen sharing

## 📊 Success Metrics

- Average active chatrooms per day
- Average room lifetime
- Message delivery latency (<200ms target)
- User engagement rate

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for privacy in digital communication
- Designed for simplicity and security

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for privacy-conscious users by Alyan**
