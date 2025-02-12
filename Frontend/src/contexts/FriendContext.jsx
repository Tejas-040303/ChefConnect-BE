import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

const FriendContext = createContext();

const friendReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'ADD_FRIEND':
      return { ...state, friends: [...state.friends, action.payload] };
    case 'REMOVE_FRIEND':
      return { ...state, friends: state.friends.filter((f) => f._id !== action.payload) };
    default:
      return state;
  }
};

export const FriendProvider = ({ children }) => {
  const [state, dispatch] = useReducer(friendReducer, { friends: [] });
  const { user } = useAuth();

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      dispatch({ type: 'SET_FRIENDS', payload: data });
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const addFriend = async (email) => {
    try {
      const response = await fetch(`/api/users?email=${email}`);
      const friend = await response.json();

      await fetch(`/api/friends/${friend._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      dispatch({ type: 'ADD_FRIEND', payload: friend });
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  return (
    <FriendContext.Provider value={{ ...state, fetchFriends, addFriend }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error('useFriend must be used within a FriendProvider');
  }
  return context;
};