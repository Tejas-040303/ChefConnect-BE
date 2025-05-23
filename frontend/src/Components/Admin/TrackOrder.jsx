import React, { useEffect, useState } from "react";
import axios from "axios";

function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    topCustomer: { name: "N/A", count: 0 },
    topChef: { name: "N/A", count: 0 },
    totalRevenue: 0
  });

  const calculateStats = (orders) => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        topCustomer: { name: "N/A", count: 0 },
        topChef: { name: "N/A", count: 0 },
        totalRevenue: 0
      }
    }
    
    const customerCounts = {};
    const chefCounts = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      totalRevenue += order.total || 0;
      
      const customerName = order.customer?.name || "Unknown Customer";
      customerCounts[customerName] = (customerCounts[customerName] || 0) + 1;
      
      const chefName = order.chef?.name || "Unknown Chef";
      chefCounts[chefName] = (chefCounts[chefName] || 0) + 1;
    });
    
    const topCustomer = Object.entries(customerCounts).reduce((top, [name, count]) => {
      return count > top.count ? { name, count } : top;
    }, { name: "N/A", count: 0 });
    
    const topChef = Object.entries(chefCounts).reduce((top, [name, count]) => {
      return count > top.count ? { name, count } : top;
    }, { name: "N/A", count: 0 });
    
    return {
      totalOrders: orders.length,
      topCustomer,
      topChef,
      totalRevenue
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.date) queryParams.append("date", filters.date);
        
        const response = await axios.get(`http://localhost:8080/admin/track-order?${queryParams.toString()}`);
        setOrders(response.data);
        setStats(calculateStats(response.data));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [filters]);

  // Get status color based on order status
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColorClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-purple-100 text-purple-800';
      case 'Awaiting Verification':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Top Customer</h3>
          <p className="text-xl font-bold truncate">{stats.topCustomer.name}</p>
          <p className="text-sm text-gray-600">{stats.topCustomer.count} orders</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Top Chef</h3>
          <p className="text-xl font-bold truncate">{stats.topChef.name}</p>
          <p className="text-sm text-gray-600">{stats.topChef.count} orders</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({status: "", date: ""})}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chef</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.chef?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.selectedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="text-blue-600 hover:text-blue-800">
                        {expandedOrder === order._id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Order Details */}
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                            <div className="space-y-2">
                              <p><strong>Order Date:</strong> {formatDateTime(order.createdAt)}</p>
                              <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                              <p><strong>Payment Status:</strong> 
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPaymentStatusColorClass(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </p>
                              <p><strong>Special Instructions:</strong> {order.specialInstructions || "None"}</p>
                            </div>
                          </div>
                          
                          {/* Order Items */}
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Dishes ({order.dishes.length})</h3>
                            <ul className="divide-y divide-gray-200">
                              {order.dishes.map((item, index) => (
                                <li key={index} className="py-2">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">{item.dish?.name || "Unknown Dish"}</p>
                                      <p className="text-sm text-gray-600">{item.dish?.description || "No description"}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.dish?.category} {">"} {item.dish?.subCategory}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p>{item.quantity}x {formatCurrency(item.dish?.price || 0)}</p>
                                      <p className="font-medium">
                                        {formatCurrency((item.quantity * (item.dish?.price || 0)))}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 pt-2 border-t border-gray-200">
                              <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Timeline */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-semibold mb-3">Order Progress</h3>
                          <div className="relative">
                            <div className="absolute left-0 w-1 bg-gray-200 h-full"></div>
                            <div className="ml-6 space-y-4">
                              {['Pending', 'Confirmed', 'Completed', 'Expired', 'Rejected'].includes(order.status) && (
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full ${
                                    order.status === 'Pending' ? 'bg-blue-500' : 
                                    (order.status === 'Confirmed' || order.status === 'Completed') ? 'bg-blue-500' : 
                                    'bg-gray-300'
                                  } -ml-2`}></div>
                                  <div className={`ml-4 ${
                                    order.status === 'Pending' ? 'text-blue-500 font-medium' : 
                                    (order.status === 'Confirmed' || order.status === 'Completed') ? 'text-blue-500 font-medium' : 
                                    'text-gray-500'
                                  }`}>Order Placed</div>
                                </div>
                              )}
                              
                              {['Confirmed', 'Completed'].includes(order.status) && (
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full ${
                                    order.status === 'Confirmed' ? 'bg-blue-500' : 
                                    order.status === 'Completed' ? 'bg-blue-500' : 
                                    'bg-gray-300'
                                  } -ml-2`}></div>
                                  <div className={`ml-4 ${
                                    order.status === 'Confirmed' ? 'text-blue-500 font-medium' : 
                                    order.status === 'Completed' ? 'text-blue-500 font-medium' : 
                                    'text-gray-500'
                                  }`}>Order Confirmed</div>
                                </div>
                              )}
                              
                              {order.status === 'Completed' && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full bg-green-500 -ml-2"></div>
                                  <div className="ml-4 text-green-500 font-medium">Order Completed</div>
                                </div>
                              )}
                              
                              {order.status === 'Rejected' && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full bg-red-500 -ml-2"></div>
                                  <div className="ml-4 text-red-500 font-medium">Order Rejected</div>
                                </div>
                              )}
                              
                              {order.status === 'Expired' && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 rounded-full bg-red-500 -ml-2"></div>
                                  <div className="ml-4 text-red-500 font-medium">Order Expired</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrackOrder;