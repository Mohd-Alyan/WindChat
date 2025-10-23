import { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Send, 
  LogOut, 
  Check, 
  Users as UsersIcon,
  Trash2,
  UserX,
  Crown,
  AlertCircle
} from 'lucide-react';
import { getSocket, disconnectSocket } from '../utils/socket';
import { encryptMessage, decryptMessage } from '../utils/encryption';

function ChatRoom({ roomKey, username, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [background, setBackground] = useState('');
  const [copied, setCopied] = useState(false);
  const [socketError, setSocketError] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Remove any existing listeners first to prevent duplicates
    socket.off('room-joined');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('receive-message');
    socket.off('user-typing');
    socket.off('promoted-to-admin');
    socket.off('removed-from-room');
    socket.off('room-deleted');
    socket.off('error');

    // Join room only once
    if (!hasJoinedRef.current) {
      socket.emit('join-room', { roomKey, username });
      hasJoinedRef.current = true;
    }

    // Room joined successfully
    socket.on('room-joined', (data) => {
      setIsAdmin(data.isAdmin);
      setBackground(data.background);
      setUsers(data.users || []);
      setSocketError('');
      
      // Add system message
      addSystemMessage(`Welcome to the room! ${data.isAdmin ? '(You are the admin)' : ''}`);
    });

    // User joined
    socket.on('user-joined', (data) => {
      setUsers((prev) => [...prev, { ...data, isTyping: false }]);
      addSystemMessage(`${data.username} joined the chat`);
    });

    // User left
    socket.on('user-left', (data) => {
      setUsers((prev) => prev.filter(u => u.socketId !== data.socketId));
      addSystemMessage(`${data.username} left the chat`);
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.socketId);
        return newSet;
      });
    });

    // Receive message
    socket.on('receive-message', async (data) => {
      try {
        const decryptedText = await decryptMessage(data.encryptedMessage, roomKey);
        setMessages((prev) => [...prev, {
          id: Date.now() + Math.random(),
          username: data.username,
          text: decryptedText,
          timestamp: data.timestamp,
          socketId: data.socketId,
          isOwn: data.socketId === socket.id
        }]);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    });

    // User typing
    socket.on('user-typing', (data) => {
      setUsers((prev) => 
        prev.map(u => 
          u.socketId === data.socketId 
            ? { ...u, isTyping: data.isTyping }
            : u
        )
      );
      
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.socketId);
        } else {
          newSet.delete(data.socketId);
        }
        return newSet;
      });
    });

    // Promoted to admin
    socket.on('promoted-to-admin', () => {
      setIsAdmin(true);
      addSystemMessage('You are now the room admin');
    });

    // Removed from room
    socket.on('removed-from-room', () => {
      alert('You have been removed from the room by the admin');
      handleLeave();
    });

    // Room deleted
    socket.on('room-deleted', () => {
      alert('This room has been deleted by the admin');
      handleLeave();
    });

    // Error
    socket.on('error', (data) => {
      setSocketError(data.message);
      if (data.message.includes('full')) {
        setTimeout(() => handleLeave(), 3000);
      }
    });

    // Cleanup
    return () => {
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('promoted-to-admin');
      socket.off('removed-from-room');
      socket.off('room-deleted');
      socket.off('error');
    };
  }, [roomKey, username]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSystemMessage = (text) => {
    setMessages((prev) => [...prev, {
      id: Date.now() + Math.random(),
      text,
      isSystem: true,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    try {
      const encryptedMessage = await encryptMessage(inputMessage, roomKey);
      socketRef.current.emit('send-message', {
        roomKey,
        encryptedMessage,
        timestamp: Date.now()
      });
      
      setInputMessage('');
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSocketError('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing-start', { roomKey });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketRef.current.emit('typing-stop', { roomKey });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(roomKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveUser = (targetSocketId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      socketRef.current.emit('admin-remove-user', { roomKey, targetSocketId });
    }
  };

  const handleDeleteRoom = () => {
    if (window.confirm('Are you sure you want to delete this room? All users will be disconnected.')) {
      socketRef.current.emit('admin-delete-room', { roomKey });
    }
  };

  const handleLeave = () => {
    hasJoinedRef.current = false;
    disconnectSocket();
    onLeave();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getTypingText = () => {
    const typingUsersList = users.filter(u => typingUsers.has(u.socketId));
    if (typingUsersList.length === 0) return '';
    if (typingUsersList.length === 1) return `${typingUsersList[0].username} is typing`;
    if (typingUsersList.length === 2) return `${typingUsersList[0].username} and ${typingUsersList[1].username} are typing`;
    return `${typingUsersList.length} people are typing`;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="glass-dark border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 bg-white/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg min-w-0">
            <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">Room:</span>
            <span className="font-mono font-semibold text-xs sm:text-base truncate">{roomKey}</span>
            <button
              onClick={handleCopyKey}
              className="ml-1 sm:ml-2 p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
              title="Copy room key"
            >
              {copied ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              )}
            </button>
          </div>
          
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">Admin</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Toggle users"
          >
            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {isAdmin && (
            <button
              onClick={handleDeleteRoom}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
              title="Delete room"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Delete</span>
            </button>
          )}
          
          <button
            onClick={handleLeave}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-sm">Leave</span>
          </button>
        </div>
      </header>

      {/* Error banner */}
      {socketError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-red-400">{socketError}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* User list sidebar - Mobile: Overlay, Desktop: Static */}
        <aside className={`
          ${showUserList ? 'flex' : 'hidden'} 
          md:flex flex-col 
          w-64 sm:w-72 md:w-64 
          glass-dark border-r border-white/10 
          p-3 sm:p-4 
          absolute md:relative 
          top-0 left-0 bottom-0 
          z-30 md:z-auto
          shadow-2xl md:shadow-none
        `}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <h3 className="font-semibold text-sm sm:text-base">Users ({users.length}/10)</h3>
            </div>
            <button
              onClick={() => setShowUserList(false)}
              className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
          
          <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin">
            {users.map((user) => (
              <div
                key={user.socketId}
                className="flex items-center justify-between p-2.5 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.username}</span>
                    {user.socketId === socketRef.current?.id && (
                      <span className="text-xs text-gray-400">(You)</span>
                    )}
                  </div>
                  {user.isTyping && (
                    <div className="flex gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full typing-dot"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full typing-dot"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full typing-dot"></span>
                    </div>
                  )}
                </div>
                
                {isAdmin && user.socketId !== socketRef.current?.id && (
                  <button
                    onClick={() => handleRemoveUser(user.socketId)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                    title="Remove user"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay backdrop for mobile sidebar */}
        {showUserList && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setShowUserList(false)}
          />
        )}

        {/* Chat area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 scrollbar-thin"
            style={{
              backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.85)), url(${background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isSystem ? 'justify-center' : msg.isOwn ? 'justify-end' : 'justify-start'} px-1`}
              >
                {msg.isSystem ? (
                  <div className="bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-gray-400">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-[85%] sm:max-w-md ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 px-1">
                      <span className="text-xs font-medium text-gray-400 truncate">
                        {msg.username}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                        msg.isOwn
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white/10 backdrop-blur-md text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm sm:text-base break-words">{msg.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <div className="px-3 sm:px-6 py-2 text-xs sm:text-sm text-gray-400 italic">
              {getTypingText()}...
            </div>
          )}

          {/* Message input */}
          <div className="glass-dark border-t border-white/10 p-2.5 sm:p-3 md:p-4 safe-bottom">
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
                placeholder="Type your message..."
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-3 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1.5 sm:gap-2 font-semibold text-sm sm:text-base"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ChatRoom;
