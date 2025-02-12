import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFriend } from '../../contexts/FriendContext';

const CommunityComponent = () => {
  const { user } = useAuth();
  const { chats, selectedChat, messages, selectChat } = useChat();
  const { sendMessage } = useWebSocket();
  const [activeTab, setActiveTab] = useState('global');
  const [searchEmail, setSearchEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const { friends, addFriend } = useFriend();
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      sendMessage({
        type: 'MESSAGE',
        content: newMessage.trim(),
        chatId: selectedChat._id,
        senderId: user._id
      });
      setNewMessage('');
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      await addFriend(searchEmail.trim());
      setSearchEmail('');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <div className="w-1/3 border-r">
        <div className="p-4 bg-gray-100 border-b flex gap-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 p-2 ${activeTab === 'global' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 p-2 ${activeTab === 'private' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Private
          </button>
        </div>

        {activeTab === 'private' ? (
          <div className="overflow-y-auto">
            {/* Add Friend Section */}
            <div className="p-4 border-b">
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Add friend by email"
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Friends List */}
            <div className="p-4">
              <h4 className="font-semibold mb-2">Friends</h4>
              {friends.map(friend => (
                <div
                  key={friend._id}
                  onClick={() => selectChat(friend)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {friend.name}
                </div>
              ))}
            </div>

            {/* Existing Chats */}
            <div className="p-4 border-t">
              <h4 className="font-semibold mb-2">Chats</h4>
              {chats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                  }`}
                >
                  {chat.participants.find(p => p._id !== user._id)?.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-semibold">Global Chat Room</h3>
            <p className="text-sm text-gray-600">Connected to global community</p>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat || activeTab === 'global' ? (
          <>
            <div className="p-4 bg-gray-100 border-b">
              <h3 className="text-lg font-semibold">
                {activeTab === 'global' 
                  ? 'Global Chat' 
                  : selectedChat.participants.find(p => p._id !== user._id)?.name}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`mb-4 ${message.sender._id === user._id ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender._id === user._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 p-2 border rounded"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityComponent;