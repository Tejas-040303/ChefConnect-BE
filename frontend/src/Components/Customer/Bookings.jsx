import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaRupeeSign } from "react-icons/fa";

const BookingProgress = ({ status, paymentStatus }) => {
  let progressPercentage = 25;
  if (status === 'Confirmed' && paymentStatus !== 'Completed') {
    progressPercentage = 50;
  } else if (status === 'Confirmed' && paymentStatus === 'Completed') {
    progressPercentage = 75;
  } else if (status === 'Completed' && paymentStatus === 'Completed') {
    progressPercentage = 100;
  } else if (status === 'Completed' && paymentStatus !== 'Completed') {
    progressPercentage = 75;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Pending</span>
        <span>Confirmed</span>
        <span>Paid</span>
        <span>Completed</span>
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
            status === 'Completed' ? 'bg-green-500' : 
            status === 'Confirmed' ? 'bg-green-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const BookingCard = ({ order, onViewDetails }) => {
  const navigate = useNavigate();
  const chefName = order.chef ? order.chef.name : 'Chef information unavailable';

  const handlePayNow = (orderId) => {
    navigate(`/customer/booking/${orderId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{chefName}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <span className="text-gray-600 w-20">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>{order.status}</span>
              </div>
              <p className="text-gray-600"><span className="w-20 inline-block">Total:</span> <FaRupeeSign className="inline-block text-xs mb-1" />{order.total}</p>
              <p className="text-gray-600">
                <span className="w-20 inline-block">Payment:</span>
                <span className={order.paymentStatus === 'Completed' ? 'text-green-600' : 'text-amber-600'}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {order.paymentStatus !== 'Completed' && (
              <button
                onClick={() => handlePayNow(order._id)}
                className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay Now
              </button>
            )}
            <button
              onClick={() => onViewDetails(order._id)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors">
              View Details
            </button>
          </div>
        </div>
        <BookingProgress status={order.status} paymentStatus={order.paymentStatus} />
      </div>
    </div>
  );
};

const Bookings = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view bookings');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/customer/cheforder/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your bookings. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      const decoded = jwtDecode(token);
      ws.send(JSON.stringify({ type: 'AUTH', userId: decoded._id }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'ORDER_UPDATE') {
        setOrders(prev => {
          const updatedOrder = data.order;
          const shouldBeInBookings = 
            updatedOrder.status === 'Pending' || 
            updatedOrder.status === 'Confirmed' || 
            (updatedOrder.status === 'Completed' && updatedOrder.paymentStatus !== 'Completed');
          
          if (!shouldBeInBookings) {
            return prev.filter(order => order._id !== updatedOrder._id);
          }

          return prev.map(order => (order._id === updatedOrder._id ? updatedOrder : order));
        });
      }
    };

    return () => ws.close();
  }, []);

  const handleViewDetails = (orderId) => {
    navigate(`/customer/booking/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-100">
        <div className="flex items-center text-red-600 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium">Error</h3>
        </div>
        <p className="text-gray-700">{error}</p>
        {error.includes('login') && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors w-full">
            Go to Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mb-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
        <p className="text-gray-600">Manage your current chef bookings</p>
      </div>
      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-gray-500 mb-4">You don't have any pending bookings</p>
          <button 
            onClick={() => navigate('/chefs')}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors">
            Find a Chef
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {orders.map(order => (
            <BookingCard
              key={order._id}
              order={order}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;