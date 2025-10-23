import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';

function App() {
  const [roomData, setRoomData] = useState(null);

  const handleJoinRoom = (data) => {
    setRoomData(data);
  };

  const handleLeaveRoom = () => {
    setRoomData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {!roomData ? (
        <LandingPage onJoinRoom={handleJoinRoom} />
      ) : (
        <ChatRoom 
          roomKey={roomData.roomKey}
          username={roomData.username}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
