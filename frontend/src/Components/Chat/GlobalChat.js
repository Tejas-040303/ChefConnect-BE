import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const GlobalChat = ({ onBack }) => {
  const { globalMessages, sendGlobalMessage, fetchGlobalMessages, loading: contextLoading, authInitialized  } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Only auto-scroll on the first page of messages or new messages
    if (page === 0) {
      scrollToBottom();
    }
  }, [globalMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await sendGlobalMessage(message);
        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
        // Could add toast notification here
      }
    }
  };

  const loadMoreMessages = async () => {
    if (loading || !hasMore || contextLoading) return;
    
    setLoading(true);
    const nextPage = page + 1;
    const moreAvailable = await fetchGlobalMessages(nextPage);
    setHasMore(moreAvailable);
    setPage(nextPage);
    setLoading(false);
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (scrollTop < 50 && hasMore && !loading) {
        loadMoreMessages();
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } else {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'}) + ' ' + 
             date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
  };

  return (
    <div className="global-chat flex flex-col h-[75vh] w-full bg-white/40 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button
          onClick={onBack}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          &larr;
        </button>
        <div>
          <h2 className="font-medium">Global Chat</h2>
          <p className="text-sm text-gray-500">Everyone can join this chat</p>
        </div>
      </div>
      
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto"
        onScroll={handleScroll}
      >
        {loading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <p className="text-gray-500 text-sm ml-2 inline-block">Loading more messages...</p>
          </div>
        )}
        
        {globalMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Be the first to say something!
          </div>
        ) : (
          <div className="space-y-3">
            {globalMessages.map((msg, idx) => {
              const isOwn = msg.sender._id === user._id;
              const showHeader = idx === 0 || globalMessages[idx-1].sender._id !== msg.sender._id;
              
              return (
                <div
                  key={idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                      isOwn ? 'bg-amber-600 text-white' : 'bg-amber-300'
                    }`}
                  >
                    {showHeader && (
                      <div className={`font-medium text-sm ${isOwn ? 'text-amber-100' : 'text-gray-700'}`}>
                        {isOwn ? 'You' : msg.sender.name}
                        <span className={`ml-2 text-xs ${isOwn ? 'text-amber-200' : 'text-gray-500'}`}>
                          ({msg.sender.role})
                        </span>
                      </div>
                    )}
                    <p className="mt-1">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-amber-100' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message to everyone..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || contextLoading}
            className="bg-amber-500 text-black px-4 py-2 rounded-r-lg hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors"
          >
            {contextLoading ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalChat;