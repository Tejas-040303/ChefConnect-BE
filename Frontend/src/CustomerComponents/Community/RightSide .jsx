import React from "react";

const RightSide = ({ selectedChat, selectedFriend, messages, newMessage, setNewMessage, handleSendMessage }) => {
    
    handleSendMessage = (message) => {
        handleSendMessage(message);
        setNewMessage("");
      };
    
  return (
    <div className="right-side">
      <h2>{selectedChat === "private" && selectedFriend ? selectedFriend : "Messages"}</h2>

      <div className="message-area">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default RightSide;
