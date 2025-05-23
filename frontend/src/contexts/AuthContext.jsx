// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set authorization header for all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch current user on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/comman/auth/me');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Authentication failed');
        // Clear invalid token
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/comman/auth/login', { email, password });

      const { jwtToken: newToken, user: userData } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', newToken);
      console.log('Token set in localStorage:', newToken);
      setToken(newToken);
      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/comman/auth/signup', userData);
      return response.data;
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;