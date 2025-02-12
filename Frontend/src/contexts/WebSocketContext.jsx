import { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const { user } = useAuth();
  const { dispatch } = useChat(); // Now works because ChatProvider is parent

  useEffect(() => {
    if (user?._id) {
      const token = localStorage.getItem('token');
      ws.current = new WebSocket(`ws://localhost:8080/ws`);

      ws.current.onopen = () => {
        ws.current.send(JSON.stringify({
          type: 'AUTH',
          userId: user._id,
          token
        }));
      };

      ws.current.onmessage = (e) => {
        const message = JSON.parse(e.data);
        if (message.type === 'MESSAGE') {
          dispatch({ type: 'NEW_MESSAGE', payload: message.message });
        }
      };

      return () => {
        if (ws.current) ws.current.close();
      };
    }
  }, [user, dispatch]);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};