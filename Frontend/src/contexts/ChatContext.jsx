import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_SELECTED_CHAT':
      return { ...state, selectedChat: action.payload };
    case 'NEW_MESSAGE':
      return {
        ...state,
        messages: [action.payload, ...state.messages],
        chats: state.chats.map(chat =>
          chat._id === action.payload.chat._id
            ? { ...chat, latestMessage: action.payload }
            : chat
        ),
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    chats: [],
    selectedChat: null,
    messages: [],
  });

  const { user } = useAuth();

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      dispatch({ type: 'SET_CHATS', payload: data });
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const selectChat = async (chat) => {
    dispatch({ type: 'SET_SELECTED_CHAT', payload: chat });
    try {
      const response = await fetch(`/api/chats/${chat._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      dispatch({ type: 'SET_MESSAGES', payload: data });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  return (
    <ChatContext.Provider value={{ ...state, dispatch, fetchChats, selectChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};