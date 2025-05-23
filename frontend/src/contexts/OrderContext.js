import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import WebSocketService from './WebSocketService';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  
  // Get WebSocket service instance
  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    // Timer for countdown
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Fetch orders initially
    fetchOrders(token);
    
    // Connect to WebSocket
    wsService.connect(token);
    
    // Initial connection status
    setIsConnected(wsService.getConnectionStatus());
    
    // Add listener for order-related messages
    const unsubscribe = wsService.addListener(handleWebSocketMessage);
    
    // Update connection status
    const connectionListener = (data) => {
      if (data.type === 'CONNECT') {
        setIsConnected(true);
      } else if (data.type === 'DISCONNECT' || data.type === 'ERROR') {
        setIsConnected(false);
      }
    };
    
    const connectionUnsubscribe = wsService.addListener(connectionListener);
    
    return () => {
      unsubscribe();
      connectionUnsubscribe();
      // clearInterval(timer);
    };
  }, []);
  
  // WebSocket message handler for order-related messages
  const handleWebSocketMessage = (data) => {
    if (!data || !data.type) return;
    
    if (data.type === "NEW_ORDER") {
      setOrders((prev) => 
        [data.order, ...prev.filter((o) => o._id !== data.order._id)]
      );
    } else if (data.type === "ORDER_UPDATE") {
      // Remove orders that are no longer pending (accepted/rejected/expired)
      if (data.order && data.order.status !== "Pending") {
        setOrders(prev => prev.filter(order => order._id !== data.order._id));
      }
    }
  };

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/chef/customerorder/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Fetched Orders:", response.data.orders);
      
      // Filter out expired orders client-side as well
      const currentTime = new Date();
      const validOrders = (response.data.orders || []).filter(
        order => new Date(order.timerExpiry) > currentTime
      );
      
      setOrders(validOrders);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:8080/chef/customerorder/accept/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleReject = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:8080/chef/customerorder/reject/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const calculateTimeLeft = (timerExpiry) => {
    const expiry = new Date(timerExpiry);
    const difference = expiry - now;
    
    if (difference <= 0) {
      // Remove expired orders automatically
      setOrders(prev => prev.filter(order => 
        order.timerExpiry !== timerExpiry
      ));
      return "Expired";
    }
    
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        handleAccept,
        handleReject,
        calculateTimeLeft,
        isConnected
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;