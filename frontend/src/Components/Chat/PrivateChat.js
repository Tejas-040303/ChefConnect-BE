// Updated React component for message filtering
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

const PrivateChat = ({ onBack }) => {
  const { 
    activeChat, 
    activeChatMessages, 
    sendPrivateMessage, 
    sendTypingIndicator, 
    typingUsers, 
    privateChats 
  } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Get chat partner info
  const chatPartner = privateChats.find(
    (chat) => chat.user._id === activeChat?.userId
  )?.user || {};

  // Store normalized messages to ensure consistent format
  const [normalizedMessages, setNormalizedMessages] = useState([]);

  // Process messages to ensure they belong to this conversation
  useEffect(() => {
    if (activeChatMessages && activeChatMessages.length > 0 && user && activeChat) {
      // Only include messages that are part of this conversation
      const filtered = activeChatMessages.filter(msg => {
        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
        const recipientId = typeof msg.recipient === 'object' ? msg.recipient._id : msg.recipient;
        
        // Message is from current user to chat partner OR from chat partner to current user
        return (senderId === user._id && recipientId === activeChat.userId) || 
               (senderId === activeChat.userId && recipientId === user._id) ||
               // For backward compatibility with existing messages that might not have recipient
               (senderId === user._id || senderId === activeChat.userId);
      });
      
      const normalized = filtered.map(msg => {
        return {
          _id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
          content: msg.content,
          timestamp: msg.timestamp,
          read: msg.read || false,
          sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender }
        };
      });
      
      setNormalizedMessages(normalized);
    } else {
      setNormalizedMessages([]);
    }
  }, [activeChatMessages, user, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [normalizedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && activeChat?.userId) {
      const tempMessage = message;
      setMessage("");
      
      try {
        setIsSending(true);
        await sendPrivateMessage(activeChat.userId, tempMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessage(tempMessage);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      
      if (activeChat.chatId) {
        sendTypingIndicator(activeChat.userId, activeChat.chatId);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const partnerIsTyping =
    activeChat?.chatId &&
    typingUsers[activeChat.chatId] &&
    typingUsers[activeChat.chatId].userId === activeChat.userId;

  return (
    <div className="private-chat flex flex-col h-[75vh] w-full bg-white/70 rounded-lg shadow-md">
      <div className="p-4 border-b flex items-center">
        <button onClick={onBack} className="mr-2 text-gray-500 hover:text-gray-700">
          &larr;
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span>{chatPartner.name ? chatPartner.name.charAt(0) : "?"}</span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{chatPartner.name || "User"}</p>
            <p className="text-sm text-gray-500">{chatPartner.role || ""}</p>
          </div>
        </div>
      </div>
      
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto">
        {normalizedMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {normalizedMessages.map((msg, idx) => {
              const isOwn = user && (
                (typeof msg.sender === 'object' && msg.sender._id === user._id) || 
                msg.sender === user._id
              );
              
              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                      isOwn ? "bg-amber-600 text-white" : "bg-amber-300 text-gray-800"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-white" : "text-black"}`}>
                      {formatTime(msg.timestamp)}
                      {isOwn && <span className="ml-2">{msg.read ? "✓✓" : "✓"}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {partnerIsTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse mx-1"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="bg-amber-500 text-black px-4 py-2 rounded-r-lg hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivateChat;