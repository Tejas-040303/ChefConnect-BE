import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import WebSocketService from "./WebSocketService";

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [privateChats, setPrivateChats] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Get WebSocket service instance
  const wsService = WebSocketService.getInstance();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (user && token) {
      wsService.connect(token);
      setAuthInitialized(true);
      // Add WebSocket message listener
      const unsubscribe = wsService.addListener(handleWebSocketMessage);

      // Subscribe to connection events
      const connectionListener = (data) => {
        if (data.type === "CONNECT") {
          // Send joining messages after connection
          wsService.send(JSON.stringify({ type: "JOIN_GLOBAL_CHAT" }));
        }
      };

      const connectionUnsubscribe = wsService.addListener(connectionListener);

      return () => {
        unsubscribe();
        connectionUnsubscribe();
        // removeListener();
      };
    }
  }, [user, token]);

  // Fetch private chats when user and token are available
  useEffect(() => {
    if (user && token) {
      fetchPrivateChats();
    }
  }, [user, token]);

  // Fetch global messages when user and token are available
  useEffect(() => {
    if (user && token) {
      fetchGlobalMessages();
    }
  }, [user, token]);

  // Add this to your PrivateChat component
useEffect(() => {
  // Set up a periodic refresh
  const refreshInterval = setInterval(() => {
    if (activeChat?.userId) {
      fetchPrivateChatMessages(activeChat.userId);
    }
  }, 5000); // Refresh every 5 seconds
  
  return () => clearInterval(refreshInterval);
}, [activeChat]);

  // Fetch private chat messages when active chat changes
  useEffect(() => {
    if (activeChat && activeChat.type === "private" && activeChat.userId) {
      fetchPrivateChatMessages(activeChat.userId);
    }
  }, [activeChat]);

  // Handle new private message

const handleNewPrivateMessage = useCallback((message) => {
  // Skip processing if the message isn't related to the current user
  if (user && !(
    // From or to current user checks
    (typeof message.sender === 'object' && message.sender._id === user._id) ||
    message.sender === user._id ||
    (typeof message.recipient === 'object' && message.recipient._id === user._id) ||
    message.recipient === user._id
  )) {
    return; // Not for this user, ignore the message
  }
  
  const isForActiveChat = activeChat && 
    activeChat.type === "private" && (
      message.sender === activeChat.userId ||
      (typeof message.sender === 'object' && message.sender._id === activeChat.userId) ||
      message.recipient === user._id ||
      (typeof message.recipient === 'object' && message.recipient._id === user._id)
    );
    
  const formattedMessage = {
    _id: message._id || message.id || Date.now().toString(),
    content: message.content,
    timestamp: message.timestamp,
    read: message.read || false,
    sender: typeof message.sender === 'object' 
      ? message.sender 
      : {_id: message.sender}
  };
  
  if (isForActiveChat || (activeChat?.chatId && message.chatId === activeChat.chatId)) {
    setActiveChatMessages(prev => {
      const messageExists = prev.some(msg => 
        (msg._id === formattedMessage._id) || 
        (msg.content === formattedMessage.content && 
         msg.timestamp === formattedMessage.timestamp)
      );
      
      if (messageExists) return prev;
      
      console.log("Adding new message to active chat:", formattedMessage);
      return [...prev, formattedMessage];
    });
    
    if (message.chatId) {
      wsService.send(JSON.stringify({
        type: "MARK_READ",
        chatId: message.chatId,
      }));
    }
  } else {
    // Update unread counts for the sender of the message
    setUnreadCounts(prev => ({
      ...prev,
      [typeof message.sender === 'object' ? message.sender._id : message.sender]: 
        (prev[typeof message.sender === 'object' ? message.sender._id : message.sender] || 0) + 1,
    }));
  }
  
  setPrivateChats(prevChats => {
    const updatedChats = [...prevChats];
    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
    
    // Find the chat between the current user and the other party
    const otherUserId = senderId === user._id ? recipientId : senderId;
    const chatIndex = updatedChats.findIndex(chat => chat.user._id === otherUserId);
    
    if (chatIndex !== -1) {
      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        lastMessage: formattedMessage,
      };
    }
    
    return updatedChats;
  });
}, [activeChat, wsService, user]);

  // Handle new global message
  const handleNewGlobalMessage = useCallback(
    (message) => {
      const messageId = message.id || message._id; // Handle both formats

      setGlobalMessages((prev) => {
        const messageExists = prev.some((msg) => (msg.id || msg._id) === messageId);
        if (messageExists) return prev;
        return [...prev, message];
      });

      if (activeChat && activeChat.type === "global") {
        setActiveChatMessages((prev) => {
          const messageExists = prev.some((msg) => (msg.id || msg._id) === messageId);
          if (messageExists) return prev;
          return [...prev, message];
        });
      }
    },
    [activeChat]
  );

  // Handle typing indicator
  const handleTypingIndicator = useCallback((data) => {
    if (data.chatId) {
      setTypingUsers((prev) => ({
        ...prev,
        [data.chatId]: {
          userId: data.userId,
          timestamp: Date.now(),
        },
      }));

      // Remove typing indicator after a delay
      setTimeout(() => {
        setTypingUsers((prev) => {
          const current = { ...prev };
          if (current[data.chatId] && current[data.chatId].userId === data.userId) {
            delete current[data.chatId];
          }
          return current;
        });
      }, 3000);
    }
  }, []);

    // Handle WebSocket messages
  // In ChatContext.js - Updated handleWebSocketMessage function

// const handleWebSocketMessage = useCallback((data) => {
//   if (!data || !data.type) return;
  
//   console.log("Processing WebSocket message:", data);
  
//   switch (data.type) {
//     case "NEW_PRIVATE_MESSAGE":
//       case "NEW_PRIVATE_MESSAGE":
//         if (data.message) {
//           // Process the message regardless of sender format
//           handleNewPrivateMessage(data.message);
          
//           // Force refresh private chats to ensure UI is updated
//           fetchPrivateChats();
//         }
//       break;
      
//     case "NEW_GLOBAL_MESSAGE":
//       handleNewGlobalMessage(data.message);
//       break;
      
//     case "TYPING":
//       handleTypingIndicator(data);
//       break;
      
//     case "MESSAGE_READ":
//       // Handle read receipts if implemented
//       break;
      
//     default:
//       console.log("Unhandled message type:", data.type);
//       break;
//   }
// }, [activeChat, privateChats, handleNewPrivateMessage, handleNewGlobalMessage, handleTypingIndicator]);

const handleWebSocketMessage = useCallback((data) => {
  if (!data || !data.type) return;
  console.log("Processing WebSocket message:", data);
  
  switch (data.type) {
    case "NEW_PRIVATE_MESSAGE":
      if (data.message) {
        // Verify this message is intended for the current user or from the current user
        if (user && (
            // Message is from the current user
            (typeof data.message.sender === 'object' && data.message.sender._id === user._id) ||
            data.message.sender === user._id ||
            // Message is to the current user
            (typeof data.message.recipient === 'object' && data.message.recipient._id === user._id) ||
            data.message.recipient === user._id
        )) {
          handleNewPrivateMessage(data.message);
          fetchPrivateChats();
        }
      }
      break;
    case "NEW_GLOBAL_MESSAGE":
      handleNewGlobalMessage(data.message);
      break;
    case "TYPING":
      handleTypingIndicator(data);
      break;
    case "MESSAGE_READ":
      break;
    default:
      console.log("Unhandled message type:", data.type);
      break;
  }
}, [activeChat, privateChats, handleNewPrivateMessage, handleNewGlobalMessage, handleTypingIndicator, user]);

  // Fetch private chats
  const fetchPrivateChats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("http://localhost:8080/api/chat/private-chats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPrivateChats(response.data);

      // Update unread counts
      const counts = {};
      response.data.forEach((chat) => {
        if (chat.unreadCount > 0) {
          counts[chat.user._id] = chat.unreadCount;
        }
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching private chats:", error);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch global messages with pagination
  const fetchGlobalMessages = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:8080/api/chat/global?page=${page}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });

      if (page === 0) {
        setGlobalMessages(response.data.messages);
      } else {
        setGlobalMessages((prev) => [...response.data.messages, ...prev]);
      }

      return response.data.hasMore;
    } catch (error) {
      console.error("Error fetching global messages:", error);
      setError("Failed to load messages. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a private chat
// In ChatContext.js - Replace the fetchPrivateChatMessages function with this improved version

const fetchPrivateChatMessages = async (userId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get(
      `http://localhost:8080/api/chat/private/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Ensure we get properly populated messages with sender objects
    const messages = response.data.messages;
    
    // Set the active chat ID if it's not already set
    if (activeChat && !activeChat.chatId && response.data.chatId) {
      setActiveChat(prev => ({
        ...prev,
        chatId: response.data.chatId
      }));
    }
    
    // Set messages and reset unread count for this user
    setActiveChatMessages(messages);
    
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[userId];
      return newCounts;
    });
    
    // Send a read receipt to update the server
    if (response.data.chatId) {
      wsService.send(JSON.stringify({
        type: "MARK_READ",
        chatId: response.data.chatId,
      }));
    }
    
    return messages;
  } catch (error) {
    console.error("Error fetching private chat messages:", error);
    setError("Failed to load messages. Please try again.");
    return [];
  } finally {
    setLoading(false);
  }
};

  // Send a private message
  const sendPrivateMessage = async (recipientId, content) => {
    if (!content.trim() || !recipientId) return;

    try {
      setError(null);

      const response = await axios.post("http://localhost:8080/api/chat/private/message", { recipientId, content }, { headers: { Authorization: `Bearer ${token}` } });

      // Update activeChat with the new chatId if it was just created
      if (response.data.chat && (!activeChat.chatId || activeChat.chatId !== response.data.chat._id)) {
        setActiveChat((prev) => ({
          ...prev,
          chatId: response.data.chat._id,
        }));
      }

      // Refresh chat list
      fetchPrivateChats();
    } catch (error) {
      console.error("Error sending private message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  // Send a global message
  // const sendGlobalMessage = async (content) => {
  //   if (!content.trim()) return;

  //   try {
  //     setError(null);

  //     await axios.post(
  //       'http://localhost:8080/api/chat/global/message',
  //       { content },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //   } catch (error) {
  //     console.error('Error sending global message:', error);
  //     setError('Failed to send message. Please try again.');
  //   }
  // };

  const sendGlobalMessage = async (content) => {
    if (!content.trim()) return;

    try {
      setError(null);

      if (!authInitialized || !user || !user._id) {
        console.error("User not available or Auth not initialized yet");
        setError("Authentication error. Please log in again.");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/chat/global/message",
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ No need to manually add the message here.
      // ✅ Wait for WebSocket to broadcast it back.
    } catch (error) {
      console.error("Error sending global message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (recipientId, chatId) => {
    wsService.send(
      JSON.stringify({
        type: "CHAT_TYPING",
        recipientId,
        chatId,
      })
    );
  };

  // Set active private chat
  // const setActivePrivateChat = (userId) => {
  //   const chat = privateChats.find((c) => c.user._id === userId);

  //   if (chat) {
  //     setActiveChat({
  //       type: "private",
  //       userId,
  //       chatId: chat.chatId,
  //     });
  //   } else {
  //     setActiveChat({
  //       type: "private",
  //       userId,
  //     });
  //   }
  // };

  const setActivePrivateChat = (userId) => {
    const chat = privateChats.find((c) => c.user._id === userId);
    if (chat) {
      setActiveChat({
        type: "private",
        userId,
        chatId: chat.chatId,
      });
    } else {
      setActiveChat({
        type: "private",
        userId,
      });
    }
  };

  // Set active global chat
  const setActiveGlobalChat = () => {
    setActiveChat({ type: "global" });
    setActiveChatMessages(globalMessages);
    console.log("Set active global chat with messages:", globalMessages);
  };

  // Clear active chat
  const clearActiveChat = () => {
    setActiveChat(null);
    setActiveChatMessages([]);
  };

  // Reset all chat data (used for logout)
  const resetChatData = () => {
    setPrivateChats([]);
    setGlobalMessages([]);
    clearActiveChat();
    setUnreadCounts({});
    setTypingUsers({});
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);

  const value = {
    privateChats,
    globalMessages,
    activeChat,
    activeChatMessages,
    loading,
    error,
    typingUsers,
    unreadCounts,
    totalUnreadCount,
    setActivePrivateChat,
    setActiveGlobalChat,
    clearActiveChat,
    sendPrivateMessage,
    sendGlobalMessage,
    sendTypingIndicator,
    fetchGlobalMessages,
    fetchPrivateChats,
    resetChatData,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
