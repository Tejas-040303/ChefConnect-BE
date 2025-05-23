import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Completed: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
    Expired: "bg-gray-200 text-gray-800",
    default: "bg-blue-200 text-blue-800"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.default}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status, method }) => {
  const paymentStatusStyles = {
    Completed: "bg-green-200 text-green-800",
    Pending: "bg-orange-200 text-orange-800",
    Failed: "bg-red-200 text-red-800",
    default: "bg-gray-200 text-gray-800"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusStyles[status] || paymentStatusStyles.default}`}>
      {method ? `${status} (${method})` : status}
    </span>
  );
};

const HistoryItem = ({ order }) => {
  const orderIdShort = order._id.substring(order._id.length - 6);
  const formattedOrderDate = new Date(order.orderDate).toLocaleDateString();
  
  return (
    <div className="border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm bg-gray-100 rounded px-2 py-1">#{orderIdShort}</span>
          <h3 className="font-semibold">{order.customer.name}</h3>
        </div>
        <div className="flex space-x-2">
          <StatusBadge status={order.status} />
          {order.status === "Completed" && (
            <PaymentBadge status={order.paymentStatus} method={order.paymentMethod} />
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Order Details</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <ul className="space-y-1">
              {order.dishes.map((dish, index) => (
                <li key={index} className="flex justify-between">
                  <span>{dish.dish.name}</span>
                  <span className="text-gray-600">x{dish.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span><FaRupeeSign className="inline-block text-xs mb-1" />{order.total}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Order Information</h4>
          <div className="bg-gray-50 p-3 rounded-md space-y-1">
            <p className="text-sm"><span className="text-gray-500 mr-2">Order Date:</span>{formattedOrderDate}</p>
            <p className="text-sm"><span className="text-gray-500 mr-2">Address:</span>{order.deliveryAddress}</p>
            
            {order.status === "Completed" && order.paymentStatus === "Completed" && (
              <p className="text-sm font-medium text-green-600">
                <span className="text-gray-500 mr-2 font-normal">Payment:</span>
                Received via {order.paymentMethod}
              </p>
            )}
            
            {(order.status !== "Completed" || order.paymentStatus !== "Completed") && (
              <p className="text-sm">
                <span className="text-gray-500 mr-2">Payment Status:</span>
                <span className={order.paymentStatus === "Completed" ? "text-green-600" : "text-yellow-600"}>
                  {order.paymentStatus}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const response = await axios.get("http://localhost:8080/chef/chefsideorder/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to load order history. Please check your connection and try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchOrderHistory, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredOrders = orders
    .filter(order => {
      // Filter by status if not "all"
      if (activeFilter !== "all" && order.status.toLowerCase() !== activeFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const orderIdShort = order._id.substring(order._id.length - 6).toLowerCase();
        const customerName = order.customer.name.toLowerCase();
        const query = searchQuery.toLowerCase();
        return orderIdShort.includes(query) || customerName.includes(query);
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sort by date, newest first

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium">Error</h3>
        </div>
        <p>{error}</p>
        <button
          onClick={fetchOrderHistory}
          className="mt-3 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold">Order History</h2>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 pl-10 border border-gray-300 rounded-md w-full md:w-64"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === 'all' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === 'completed' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === 'rejected' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected
            </button>
            <button
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === 'expired' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('expired')}>
              Expired
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="mt-2 text-gray-500">
            {searchQuery ? 'No orders matching your search' : `No ${activeFilter !== 'all' ? activeFilter : 'past'} orders found`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <HistoryItem key={order._id} order={order} />
          ))}

          {filteredOrders.length > 0 && (
            <div className="text-center text-gray-500 text-sm pt-4">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;