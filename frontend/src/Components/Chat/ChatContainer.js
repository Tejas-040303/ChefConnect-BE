import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatList from './ChatList';
import PrivateChat from './PrivateChat';
import GlobalChat from './GlobalChat';
// import ErrorAlert from '../common/ErrorAlert';

const ChatContainer = () => {
  const { activeChat, error, totalUnreadCount } = useChat();
  const { user } = useAuth();
  const [view, setView] = useState('chats');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (activeChat?.type === 'private') {
      setView('private');
    } else if (activeChat?.type === 'global') {
      setView('global');
    }
  }, [activeChat]);
  
  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const renderChatView = () => {
    if (view === 'chats') {
      return (
        <ChatList
          onSelectChat={(type) => {
            setView(type);
          }}
        />
      );
    } else if (view === 'private' && activeChat?.type === 'private') {
      return (
        <PrivateChat
          onBack={() => setView('chats')}
        />
      );
    } else if (view === 'global') {
      return (
        <GlobalChat
          onBack={() => setView('chats')} 
        />
      );
    }
    
    // Fallback to chat list
    return (
      <ChatList onSelectChat={(type) => setView(type)} />
    );
  };
  
  return (
    <div className="chat-container bg-white/40 rounded-lg shadow-md w-full max-w-3xl mx-auto">
        <div className="flex items-center">
          {totalUnreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalUnreadCount}
            </span>
          )}
        </div>
        
        {view !== 'chats' }
      
      {/* {showError && <ErrorAlert message={error} onClose={() => setShowError(false)} />} */}
      
      {renderChatView()}
    </div>
  );
};

export default ChatContainer;