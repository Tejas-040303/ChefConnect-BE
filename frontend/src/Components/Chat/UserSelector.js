import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";

const UserSelector = ({ onClose, onSelectChat, onUserSelect  }) => {
  const { user } = useAuth();
  const { setActivePrivateChat } = useChat();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("all");

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const allUsers = response.data || [];
      const filteredUsers = allUsers.filter((u) => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    if (onUserSelect) {
        onUserSelect(userId);
      }
    setActivePrivateChat(userId);
    onSelectChat && onSelectChat('private');
    if (onClose) {
        onClose();
      }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = userType === "all" || u.role === userType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="user-selector p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium mb-4">Start a Conversation</h3>
      
      {/* Search and filter controls */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="p-2 pl-8 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setUserType("all")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              userType === "all" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUserType("Chef")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              userType === "Chef" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Chefs
          </button>
          <button
            onClick={() => setUserType("Customer")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              userType === "Customer" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Customers
          </button>
        </div>
      </div>
      
      {/* User list */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-2">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-2">
            {searchTerm || userType !== "all" ? "No matching users found" : "No users available"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserSelect(u._id)}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span>{u.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelector;