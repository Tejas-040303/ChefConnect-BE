import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";

// Status badge component for order status visualization
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Completed: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
    default: "bg-blue-100 text-blue-800"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.default}`}>
      {status}
    </span>
  );
};

// Order history item component
const OrderHistoryItem = ({ order, onViewDetails }) => {
  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });

  // Handle click on the card
  const handleCardClick = () => {
    onViewDetails(order._id);
  };

  // Prevent propagation when clicking the button
  const handleButtonClick = (e) => {
    e.stopPropagation();
    onViewDetails(order._id);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-50 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{order.chef?.name || "Unknown Chef"}</h3>
              <p className="text-sm text-gray-500">Order #{order._id.substring(order._id.length - 6)}</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Order Date</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Total Amount</span>
            <span className="font-medium"><FaRupeeSign className="inline-block text-xs mb-1" />{order.total?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Payment Status</span>
            <span className={`font-medium ${order.isPaid ? "text-green-600" : "text-amber-600"}`}>
              {order.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={handleButtonClick}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderHistoryDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please log in to view your order history.");
          setLoading(false);
          return;
        }
        
        const response = await axios.get("http://localhost:8080/customer/cheforder/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Order history response:", response.data);
        // Backend already filters for completed+paid, rejected, or expired
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order history:", error);
        const errorMessage = error.response?.data?.message || 
          "Failed to load order history. Please check your connection and try again.";
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchOrderHistory();
  }, []);

  const handleViewDetails = (orderId) => {
    navigate(`/customer/booking/${orderId}`);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (statusFilter !== "all" && order.status.toLowerCase() !== statusFilter) {
      return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const chefName = (order.chef?.name || "").toLowerCase();
      const orderId = order._id.toLowerCase();
      
      return chefName.includes(searchLower) || orderId.includes(searchLower);
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-red-700 mb-2">Something went wrong</p>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button 
              className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
              onClick={() => navigate("/customer/dashboard")}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Order History</h2>
        <p className="text-gray-600">View and track all your past orders</p>
      </div>
      
      {orders.length > 0 && (
  <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
    <div className="relative w-full md:w-64">
      <input
        type="text"
        placeholder="Search by chef or order ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg self-end">
      <button
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'all' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        onClick={() => setStatusFilter('all')}>
        All
      </button>
      <button
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'completed' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        onClick={() => setStatusFilter('completed')}>
        Completed
      </button>
      <button
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'rejected' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        onClick={() => setStatusFilter('rejected')}>
        Rejected
      </button>
      <button
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'expired' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        onClick={() => setStatusFilter('expired')}>
        Expired
      </button>
    </div>
  </div>
)}
      
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg mb-4">No past orders found</p>
          <p className="text-gray-500 mb-6">Book a chef to get started with your culinary journey</p>
          <button 
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
            onClick={() => navigate("/customer/dashboard")}
          >
            Find Chefs
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 text-lg">No orders match your search</p>
          <button 
            className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderHistoryItem 
              key={order._id} 
              order={order} 
              onViewDetails={handleViewDetails} 
            />
          ))}
          
          <div className="text-center text-gray-500 mt-6">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryDetails;