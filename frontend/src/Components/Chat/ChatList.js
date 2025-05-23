import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import UserSelector from './UserSelector';

const ChatList = ({ onSelectChat }) => {
  const { privateChats, unreadCounts, setActivePrivateChat, setActiveGlobalChat } = useChat();
  const { user } = useAuth();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleGlobalChatSelect = () => {
    setActiveGlobalChat();
    onSelectChat('global');
  };
  
  const handleChatSelect = (chat) => {
    setActivePrivateChat(chat.user._id);
    onSelectChat('private');
  };
  
  const filteredChats = privateChats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatLastMessage = (message) => {
    if (!message) return 'Start a conversation';
    
    return message.content.length > 25 
      ? `${message.content.substring(0, 25)}...` 
      : message.content;
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className="chat-list">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="relative w-full mr-2">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <button
          onClick={() => setShowUserSelector(!showUserSelector)}
          className="flex-shrink-0 bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {showUserSelector && (
        <div className="p-4 border-b">
          <UserSelector onClose={() => setShowUserSelector(false)} />
        </div>
      )}
      
      {/* Global Chat Option */}
      <div
        className="p-4 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
        onClick={handleGlobalChatSelect}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-medium">Global Chat</p>
            <p className="text-sm text-gray-500">Everyone can join</p>
          </div>
        </div>
      </div>
      
      {/* Private Chats List */}
      <div className="overflow-y-auto max-h-96">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => handleChatSelect(chat)}
            >
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span>{chat.user.name.charAt(0)}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{chat.user.name}</p>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(chat.lastMessage.timestamp)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {formatLastMessage(chat.lastMessage)}
                  </p>
                </div>
              </div>
              
              {unreadCounts[chat.user._id] > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCounts[chat.user._id]}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;