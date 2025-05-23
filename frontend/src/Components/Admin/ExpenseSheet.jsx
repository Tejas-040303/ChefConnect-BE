import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ExpenseSheet() {
  // State variables
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [ordersSummary, setOrdersSummary] = useState(null);
  const [formData, setFormData] = useState({
    expenseType: 'Platform Fee',
    totalAmount: 0,
    notes: '',
    approvalStatus: 'Pending'
  });
  const [filters, setFilters] = useState({
    expenseType: '',
    startDate: null,
    endDate: null,
    approvalStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
      });

      const response = await axios.get(`http://localhost:8080/admin/expense-sheet?${queryParams}`, {
        headers: { Authorization: localStorage.getItem('adminToken') }
      });

      setExpenses(response.data.expenses);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setLoading(false);
    }
  };

  // Fetch expense summary
  const fetchExpenseSummary = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
      });

      const response = await axios.get(`http://localhost:8080/admin/expense-sheet/summary?${queryParams}`, {
        headers: { Authorization: localStorage.getItem('adminToken') }
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error('Failed to fetch expense summary', err);
    }
  };

  // Fetch orders summary
  const fetchOrdersSummary = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
      });

      // Remove the token header since we've made this endpoint public
      const response = await axios.get(
        `http://localhost:8080/admin/expense-sheet/orders-summary?${queryParams}`
      );

      console.log('Orders Summary:', response.data);
      setOrdersSummary(response.data.summary);
    } catch (err) {
      console.error('Failed to fetch orders summary', err);
    }
  };

  // Update the useEffect to call this new function
  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
    fetchOrdersSummary();
  }, [currentPage, filters]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle date filter changes
  const handleDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      expenseType: '',
      startDate: null,
      endDate: null,
      approvalStatus: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Create expense
  const createExpense = async () => {
    try {
      setLoading(true);

      // Create formData with the added expenseId
      const expenseFormData = {
        ...formData,
        expenseId: `EXP-${Date.now()}` // Generate a unique expense ID
      };

      const response = await axios.post('http://localhost:8080/admin/expense-sheet', expenseFormData, {
        headers: { Authorization: localStorage.getItem('adminToken') }
      });

      setShowAddModal(false);
      setFormData({
        expenseType: 'Platform Fee',
        totalAmount: 0,
        notes: '',
        approvalStatus: 'Pending'
      });

      fetchExpenses();
      fetchExpenseSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create expense');
      setLoading(false);
    }
  };

  // Update expense
  const updateExpense = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:8080/admin/expense-sheet/${selectedExpense._id}`, formData, {
        headers: { Authorization: localStorage.getItem('adminToken') }
      });

      setShowEditModal(false);
      fetchExpenses();
      fetchExpenseSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
      setLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8080/admin/expense-sheet/${id}`, {
          headers: { Authorization: localStorage.getItem('adminToken') }
        });

        fetchExpenses();
        fetchExpenseSummary();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete expense');
        setLoading(false);
      }
    }
  };

  // Update approval status
  const updateApprovalStatus = async (id, status) => {
    try {
      setLoading(true);
      await axios.patch(`http://localhost:8080/admin/expense-sheet/${id}/status`, { approvalStatus: status }, {
        headers: { Authorization: localStorage.getItem('adminToken') }
      });

      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update approval status');
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      expenseType: expense.expenseType,
      totalAmount: expense.totalAmount,
      notes: expense.notes || '',
      approvalStatus: expense.approvalStatus
    });
    setShowEditModal(true);
  };

  // Initial load
  useEffect(() => {
    fetchExpenses();
    fetchExpenseSummary();
  }, [currentPage, filters]);

  // Prepare chart data for expense by type
  const expenseByTypeChartData = {
    labels: summary?.expensesByType?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Expense Amount',
        data: summary?.expensesByType?.map(item => item.total) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for monthly expenses
  const monthlyExpenseChartData = {
    labels: summary?.monthlyExpenses?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: summary?.monthlyExpenses?.map(item => item.total) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Render pagination component
  const renderPagination = () => {
    const items = [];

    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <button
          key={number}
          className={`px-3 py-1 mx-1 rounded ${number === currentPage
            ? 'bg-blue-500 text-white'
            : 'bg-white text-blue-500 border border-blue-500'
            }`}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6">
        <button
          className="px-3 py-1 mx-1 rounded bg-white text-blue-500 border border-blue-500 disabled:opacity-50"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {items}
        <button
          className="px-3 py-1 mx-1 rounded bg-white text-blue-500 border border-blue-500 disabled:opacity-50"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  // Modal component
  const Modal = ({ show, onClose, title, children, footer }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="flex justify-between items-center border-b px-6 py-3">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
          <div className="px-6 py-3 border-t flex justify-end space-x-2">
            {footer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Expense Management Dashboard</h1>

      {ordersSummary && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Revenue Distributions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 h-full">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Order Revenue</h3>
              <p className="text-3xl font-bold">&#8377;{ordersSummary.totalOrderAmount?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 h-full">
              <h3 className="text-sm font-medium text-green-700 mb-1">Chef Share (80%)</h3>
              <p className="text-3xl font-bold text-green-600">&#8377;{ordersSummary.chefShare?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 h-full">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Admin/Platform (20%)</h3>
              <p className="text-3xl font-bold text-blue-600">&#8377;{ordersSummary.adminShare?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 h-full">
              <h3 className="text-sm font-medium text-purple-700 mb-1">Tax (12%)</h3>
              <p className="text-3xl font-bold text-purple-600">&#8377;{ordersSummary.taxAmount?.toFixed(2) || 0}</p>
            </div>
          </div>
        </div>
      )}

      {ordersSummary && ordersSummary.ordersByChef && ordersSummary.ordersByChef.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Top Chef Revenue Distribution</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chef Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chef Share (80%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersSummary.ordersByChef.map((chef) => (
                  <tr key={chef.chefId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{chef.chefName || 'Unknown Chef'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">&#8377;{chef.totalAmount?.toFixed(2) || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">&#8377;{chef.chefShare?.toFixed(2) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ordersSummary && ordersSummary.monthlyOrders && ordersSummary.monthlyOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Monthly Revenue Distribution</h2>
          <div className="h-64">
            <Bar
              data={{
                labels: ordersSummary.monthlyOrders.map(item => item.month),
                datasets: [
                  {
                    label: 'Chef Share (80%)',
                    data: ordersSummary.monthlyOrders.map(item => item.chefShare),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Admin Share (20%)',
                    data: ordersSummary.monthlyOrders.map(item => item.adminShare),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Tax (12%)',
                    data: ordersSummary.monthlyOrders.map(item => item.taxAmount),
                    backgroundColor: 'rgba(147, 51, 234, 0.6)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      <hr className="my-8 border-t border-gray-900" />

      {/* Add New Expense Button */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-8">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          {error}
          <button
            onClick={() => setError(null)}
            className="absolute top-0 right-0 p-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-lg font-medium mb-2">Total Expenses</h2>
            <p className="text-3xl font-bold">&#8377;{summary.totalExpenseAmount?.toFixed(2) || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-lg font-medium mb-2">Expenses by Type</h2>
            <div className="h-48">
              <Bar
                data={expenseByTypeChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-lg font-medium mb-2">Monthly Expenses</h2>
            <div className="h-48">
              <Bar
                data={monthlyExpenseChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}


      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Type
              </label>
              <select
                name="expenseType"
                value={filters.expenseType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Chef Payment">Chef Payment</option>
                <option value="Platform Fee">Platform Fee</option>
                <option value="Delivery Charges">Delivery Charges</option>
                <option value="Marketing">Marketing</option>
                <option value="Payment Processing">Payment Processing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select start date"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select end date"
                dateFormat="yyyy-MM-dd"
                minDate={filters.startDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Status
              </label>
              <select
                name="approvalStatus"
                value={filters.approvalStatus}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Creation Date</option>
                <option value="date">Expense Date</option>
                <option value="totalAmount">Amount</option>
                <option value="expenseType">Type</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={resetFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Expense List</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              No expenses found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.expenseId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.expenseType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        &#8377;{expense.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusBadgeColor(expense.approvalStatus)}`}>
                          {expense.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.notes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="text-blue-600 hover:text-blue-900 border border-blue-600 px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => updateApprovalStatus(expense._id, 'Approved')}
                            disabled={expense.approvalStatus === 'Approved'}
                            className={`text-green-600 hover:text-green-900 border border-green-600 px-2 py-1 rounded text-xs ${expense.approvalStatus === 'Approved' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApprovalStatus(expense._id, 'Rejected')}
                            disabled={expense.approvalStatus === 'Rejected'}
                            className={`text-red-600 hover:text-red-900 border border-red-600 px-2 py-1 rounded text-xs ${expense.approvalStatus === 'Rejected' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => deleteExpense(expense._id)}
                            className="text-red-600 hover:text-red-900 border border-red-600 px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {renderPagination()}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Expense"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={createExpense}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Expense
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type
            </label>
            <select
              name="expenseType"
              value={formData.expenseType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Chef Payment">Chef Payment</option>
              <option value="Platform Fee">Platform Fee</option>
              <option value="Delivery Charges">Delivery Charges</option>
              <option value="Marketing">Marketing</option>
              <option value="Payment Processing">Payment Processing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Expense"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={updateExpense}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Expense
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type
            </label>
            <select
              name="expenseType"
              value={formData.expenseType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Chef Payment">Chef Payment</option>
              <option value="Platform Fee">Platform Fee</option>
              <option value="Delivery Charges">Delivery Charges</option>
              <option value="Marketing">Marketing</option>
              <option value="Payment Processing">Payment Processing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
      </Modal>

      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(!1)}
        title="Edit Expense"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(!1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={updateExpense}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Expense
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
            <select
              name="expenseType"
              value={formData.expenseType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Chef Payment">Chef Payment</option>
              <option value="Platform Fee">Platform Fee</option>
              <option value="Delivery Charges">Delivery Charges</option>
              <option value="Marketing">Marketing</option>
              <option value="Payment Processing">Payment Processing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ExpenseSheet;