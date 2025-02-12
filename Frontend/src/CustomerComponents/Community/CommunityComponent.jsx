import React, { useState } from "react";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide ";
import "./style.css"
const CommunityComponent = () => {
  const [selectedChat, setSelectedChat] = useState("global"); // 'global' or 'private'
  const [selectedFriend, setSelectedFriend] = useState(null); // Track selected friend
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "You" }]);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <LeftSide
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
      />
      <RightSide
        selectedChat={selectedChat}
        selectedFriend={selectedFriend}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default CommunityComponent;
