import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// import * as jwtDecode from 'jwt-decode';

const BookingConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };
    fetchOrder();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      const token = localStorage.getItem('token');
      const { user_id } = jwtDecode(token);
      ws.send(JSON.stringify({ type: 'AUTH', userId: user_id }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'ORDER_UPDATE' && data.order._id === orderId) {
        setOrder(data.order);
      }
    };

    return () => {
        if (ws.readyState === 1) { // <-- This is important
            ws.close();
        }
    };
  }, [orderId]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!order || order.status !== 'Pending') return;
      const expiry = new Date(order.timerExpiry);
      const difference = expiry - new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [order]);

  if (!order) return <div>Loading order details...</div>;

  return (
    <div className="booking-confirmation">
      <h2>Order Status: {order.status}</h2>
      {order.status === 'Pending' && (
        <div>
          <p>Waiting for chef to respond... Time remaining: {timeLeft}</p>
        </div>
      )}
      {order.status === 'Confirmed' && (
        <p>Your order has been confirmed by the chef!</p>
      )}
      {order.status === 'Cancelled' && (
        <p>The order has been cancelled.</p>
      )}
    </div>
  );
};

export default BookingConfirmation;