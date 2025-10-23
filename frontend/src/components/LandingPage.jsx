import { useState } from 'react';
import { MessageSquare, Key, User, Sparkles, Shield, Users, Zap } from 'lucide-react';
import { generateRoomKey } from '../utils/encryption';

function LandingPage({ onJoinRoom }) {
  const [username, setUsername] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomKey.trim()) {
      setError('Please enter a room key');
      return;
    }

    if (username.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (roomKey.trim().length < 4) {
      setError('Room key must be at least 4 characters');
      return;
    }

    onJoinRoom({
      username: username.trim(),
      roomKey: roomKey.trim()
    });
  };

  const handleGenerateAndJoin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (username.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const newKey = generateRoomKey();
    setRoomKey(newKey);
    
    onJoinRoom({
      username: username.trim(),
      roomKey: newKey
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WindChat
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Anonymous Chat,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                No Strings Attached
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-md">
              Secure, ephemeral conversations with end-to-end encryption. No registration, no tracking, no traces.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">Up to 10 Users</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Real-time Messaging</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">Auto-Delete Rooms</span>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Join or Create a Room</h2>
            
            <form onSubmit={handleJoin} className="space-y-6">
              {/* Username input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Room key input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Room Key
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={roomKey}
                    onChange={(e) => setRoomKey(e.target.value)}
                    placeholder="Enter room key or generate one"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Share this key with others to join the same room
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
                >
                  Join Chat
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAndJoin}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate & Join New Room
                </button>
              </div>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                🔒 Your messages are end-to-end encrypted and automatically deleted when the room is empty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
