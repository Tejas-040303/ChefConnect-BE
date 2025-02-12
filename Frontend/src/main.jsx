import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { FriendProvider } from './contexts/FriendContext';
import MainApp from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <ChatProvider>
      <WebSocketProvider>
        <FriendProvider>
          <MainApp />
        </FriendProvider>
      </WebSocketProvider>
    </ChatProvider>
  </AuthProvider>
);