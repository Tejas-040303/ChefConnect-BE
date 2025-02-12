import React from "react";

const LeftSide = ({ selectedChat, setSelectedChat, selectedFriend, setSelectedFriend }) => {
  const friends = ["Friend 1", "Friend 2", "Friend 3"]; // Sample friends list

  return (
    <div className="left-side">
      <h2>Chats</h2>
      <div className="chat-options">
        <button
          className={selectedChat === "global" ? "active" : ""}
          onClick={() => {
            setSelectedChat("global");
            setSelectedFriend(null);
          }}
        >
          🌍 Global Chat
        </button>
        <button
          className={selectedChat === "private" ? "active" : ""}
          onClick={() => setSelectedChat("private")}
        >
          🔒 Private Chat
        </button>
      </div>

      {selectedChat === "private" && (
        <div className="friend-list">
          <h3>Private Chats</h3>
          {friends.map((friend) => (
            <p
              key={friend}
              className={selectedFriend === friend ? "selected-friend" : ""}
              onClick={() => setSelectedFriend(friend)}
            >
              {friend}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeftSide;
