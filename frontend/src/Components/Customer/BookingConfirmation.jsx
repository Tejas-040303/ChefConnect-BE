import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaRupeeSign } from "react-icons/fa";

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState(null);
  const [expirationAttempted, setExpirationAttempted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please log in to view your order.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const response = await axios.get(`http://localhost:8080/customer/cheforder/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
        if (response.data.status !== "Pending") {
          setIsExpired(response.data.status === "Expired" || response.data.status === "Rejected");
        } else if (response.data.timerExpiry) {
          const expiry = new Date(response.data.timerExpiry);
          const now = new Date();
          console.log("Order timer expiry:", expiry);
          console.log("Current time:", now);
          console.log("Difference (ms):", expiry - now);
          if (now > expiry) {
            setIsExpired(true);
            if (!expirationAttempted) {
              setExpirationAttempted(true);
              handleOrderExpiration(response.data._id, token);
            }
          }
        }
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError(error.response?.status === 404 ? "Order not found." : "Failed to load order details.");
        setLoading(false);
      }
    };

    fetchOrder();

    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded._id;
      ws.send(JSON.stringify({ type: "AUTH", userId }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "ORDER_UPDATE" && data.order._id === id) {
        console.log("Received order update via WebSocket:", data.order);
        setOrder(data.order);
        if (data.order.status === "Expired" || data.order.status === "Rejected") {
          setIsExpired(true);
        }
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [id, expirationAttempted]);

  const handleOrderExpiration = async (orderId, token) => {
    if (expirationAttempted) {
      console.log("Expiration already attempted, skipping");
      return;
    }
    try {
      console.log("Waiting 1 second before sending expire request...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Sending expire request for order:", orderId);
      const decoded = jwtDecode(token);
      console.log("User ID sending request:", decoded.id || decoded._id);
      const response = await axios.put(`http://localhost:8080/customer/cheforder/${orderId}/expire`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Order expiration successful:", response.data);
      setOrder(response.data);
      setIsExpired(true);
    } catch (error) {
      console.error("Error updating expired order:", error);
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
        if (error.response.status === 400) {
          const errorMsg = error.response.data.message;
          if (errorMsg === "Only pending orders can be expired") {
            console.log("Order is no longer in pending state, may have been updated by another client");
            fetchLatestOrder(token);
          } else if (errorMsg === "Order timer has not expired yet") {
            console.log("Server clock and client clock may be out of sync");
          }
        }
      }
    }
  };

  const fetchLatestOrder = async (token) => {
    try {
      const response = await axios.get(`http://localhost:8080/customer/cheforder/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Refreshed order data:", response.data);
      setOrder(response.data);
      if (response.data.status !== "Pending") {
        setIsExpired(response.data.status === "Expired" || response.data.status === "Rejected");
      }
    } catch (error) {
      console.error("Error refreshing order:", error);
    }
  };

  useEffect(() => {
    let timer;
    const calculateTimeLeft = () => {
      if (!order || order.status !== "Pending" || !order.timerExpiry) {
        setTimeLeft("");
        return;
      }
      const expiry = new Date(order.timerExpiry);
      const now = new Date();
      const difference = expiry - now;
      if (difference <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        if (order.status === "Pending" && !expirationAttempted) {
          const token = localStorage.getItem("token");
          if (token) {
            setExpirationAttempted(true);
            handleOrderExpiration(order._id, token);
          }
        }
        return;
      }
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [order, expirationAttempted]);

  const handleBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-amber-700 hover:text-amber-900 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd" />
            </svg>
            Back
          </button>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-red-600 px-6 py-8 text-white">
              <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-3xl font-bold text-center">Error</h2>
            </div>
            <div className="p-8 text-center">
              <p className="mb-6 text-gray-700 text-lg">{error}</p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors">Go to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="text-center p-8 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 border-opacity-50 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-amber-800">Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-amber-500 text-5xl mb-4">❓</div>
          <h2 className="text-xl font-medium text-gray-800">Order not found</h2>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-600";
      case "Rejected": return "bg-red-600";
      case "Expired": return "bg-gray-600";
      case "Pending": return "bg-amber-600";
      default: return "bg-blue-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "Rejected":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "Expired":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Pending":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-amber-700 hover:text-amber-900 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="bg-white/50 rounded-2xl shadow-xl overflow-hidden">
          {}
          <div className={`px-6 py-8 text-white ${getStatusColor(order.status)}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                {getStatusIcon(order.status)}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center">Booking {order.status}</h2>
            <p className="text-center mt-2 opacity-90">
              {order.status === "Confirmed" && "Your chef booking has been confirmed!"}
              {order.status === "Pending" && "Waiting for chef to confirm your booking"}
              {order.status === "Rejected" && "This booking has been rejected by the chef"}
              {order.status === "Expired" && "This booking has expired as chef didn't respond in time"}
            </p>
          </div>
          {}
          <div className="p-6 md:p-8">
            {}
            <div className="bg-amber-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                Chef Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700">Chef: </span>{order.chef?.name || "Unknown"}</p>
                <p><span className="font-medium text-gray-700">Order ID: </span><span className="text-gray-500 text-sm">{order._id}</span></p>
              </div>
            </div>
            {}
            <div className="bg-amber-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                </svg>
                Dishes Ordered
              </h3>
              <div className="divide-y divide-amber-200">
                {order.dishes.map((item, index) => (
                  <div key={index} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.dish.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-amber-600">${(item.dish.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            {}
            <div className="bg-amber-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Date</p>
                  <p className="font-medium">{new Date(order.selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Time Slot</p>
                  <p className="font-medium">{order.selectedTimeSlot.startTime} - {order.selectedTimeSlot.endTime}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="font-medium">{order.deliveryAddress || "No address provided"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Number of People</p>
                  <p className="font-medium">{order.numberOfPeople}</p>
                </div>
                {order.allergies && order.allergies.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500 text-sm">Allergies</p>
                    <p className="font-medium">{order.allergies.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
            {}
            <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Total Amount</h3>
                <div className="text-2xl font-bold text-amber-600"><FaRupeeSign className="inline-block text-xs mb-1" />{order.total.toFixed(2)}</div>
              </div>
              {order.status === "Pending" && !isExpired && (
                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-amber-800">Chef will respond within <span className="font-bold">{timeLeft}</span></p>
                  </div>
                </div>
              )}
              {order.status === "Confirmed" && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/customer/booking/${id}`)}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate(`/customer/payment/${id}`)}
                    className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pay Now
                  </button>
                </div>
              )}
              {(order.status === "Rejected" || order.status === "Expired" || isExpired) && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-700 font-medium mb-4">{order.status === "Rejected" ? "This booking has been rejected by the chef." : "This booking has expired as the chef didn't respond in time."}</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => navigate("/customer/order-history")}
                      className="py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Order History
                    </button>
                    <button
                      onClick={() => navigate("/customer/dashboard")}
                      className="py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find Another Chef
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;