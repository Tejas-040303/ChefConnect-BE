import React, { useState } from 'react';
import ChatContainer from '../../Components/Chat/ChatContainer';
import UserSelector from '../../Components/Chat/UserSelector';
import { useChat } from '../../contexts/ChatContext';

const ChatPage = () => {
  const [showUserSelector, setShowUserSelector] = useState(false);
  const { setActivePrivateChat } = useChat();

  // Create a handler for user selection
  const handleUserSelect = (userId) => {
    setActivePrivateChat(userId);
    setShowUserSelector(false);
    // We don't need to manually set the view here because
    // ChatContainer will handle showing the correct component
    // based on the activeChat state
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500">
          Community
        </h1>
        <button
          onClick={() => setShowUserSelector(!showUserSelector)}
          className="bg-gradient-to-br from-amber-300 to-purple-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors"
        >
          {showUserSelector ? 'Hide User List' : 'New Conversation'}
        </button>
      </div>

      {showUserSelector && (
        <div className="mb-6">
          <UserSelector onClose={() => setShowUserSelector(false)} onUserSelect={handleUserSelect} />
        </div>
      )}

      <ChatContainer />
    </div>
  );
};

export default ChatPage;