import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderItem from "./OrderItem"; // Import the separate OrderItem component

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        "http://localhost:8080/chef/chefsideorder/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(
        "Failed to load orders. Please check your connection and try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up polling to refresh orders every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleComplete = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/chef/chefsideorder/complete/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update order status in state
      setOrders((prev) => {
        return prev.map(order =>
          order._id === orderId
            ? { ...order, status: "Completed" }
            : order
        );
      });
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const handlePaymentReceived = async (orderId, paymentMethod) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/chef/chefsideorder/payment-received/${orderId}`,
        { paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update payment status in state
      setOrders((prev) => {
        return prev.map(order =>
          order._id === orderId
            ? { ...order, paymentStatus: "Completed", paymentMethod }
            : order
        );
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter(order => {
        switch (activeTab) {
          case "confirmed":
            return order.status === "Confirmed";
          case "payment-pending":
            return order.status === "Completed" && 
                  (order.paymentStatus === "Pending" || 
                   order.paymentStatus === "Awaiting Verification");
          case "order-completed":
            return order.status === "Completed";
          default:
            return true;
        }
      });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-medium">Error</h3>
        </div>
        <p>{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-3 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Current Orders</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "confirmed" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "payment-pending" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("payment-pending")}
          >
            Payment Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === "order-completed" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("order-completed")}
          >
            Order Completed
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-gray-500">
            No {activeTab !== "all" ? activeTab : ""} orders found
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderItem
              key={order._id}
              order={order}
              onComplete={handleComplete}
              onPaymentReceived={handlePaymentReceived}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;