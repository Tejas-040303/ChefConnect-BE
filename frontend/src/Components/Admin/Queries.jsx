import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function Queries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [emailStatus, setEmailStatus] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/admin/queries');
        setQueries(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch queries');
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const updateQueryStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/admin/queries/${id}`, { status: newStatus });
      setQueries(queries.map(query => query._id === id ? {...query, status: newStatus} : query));
    } catch (err) {
      setError('Failed to update query status');
    }
  };

  const openEmailModal = (query) => {
    setCurrentQuery(query);
    setEmailContent(''); // Reset email content
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setCurrentQuery(null);
  };

  const sendEmailNotification = async () => {
    if (!currentQuery || !emailContent.trim()) return;

    try {
      setEmailStatus(prev => ({ ...prev, [currentQuery._id]: 'sending' }));
      await axios.post(`http://localhost:8080/admin/queries/send-email/${currentQuery._id}`, {
        adminResponse: emailContent
      });
      setEmailStatus(prev => ({ ...prev, [currentQuery._id]: 'sent' }));
      
      // Reset email status after 3 seconds
      setTimeout(() => {
        setEmailStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[currentQuery._id];
          return newStatus;
        });
      }, 3000);
      
      closeEmailModal();
    } catch (err) {
      setEmailStatus(prev => ({ ...prev, [currentQuery._id]: 'error' }));
      setTimeout(() => {
        setEmailStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[currentQuery._id];
          return newStatus;
        });
      }, 3000);
    }
  };

  const filteredQueries = queries.filter(query => {
    return (statusFilter === 'All' || query.status === statusFilter) &&
           (roleFilter === 'All' || query.role === roleFilter);
  });

  if (loading) return <div className="text-center py-8">Loading queries...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Support Queries</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md">
              <option value="All">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Chef">Chef</option>
              <option value="Anonymous">Anonymous</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('All');
                setRoleFilter('All');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((query) => (
                <tr key={query._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{query.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{query.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{query.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{query.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{query.query}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(query.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      query.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <select
                        value={query.status}
                        onChange={(e) => updateQueryStatus(query._id, e.target.value)}
                        disabled={query.status === 'Resolved'}
                        className={`p-1 border border-gray-300 bg-white rounded-md text-sm ${
                          query.status === 'Resolved' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      
                      <button
                        onClick={() => openEmailModal(query)}
                        className={`px-2 py-1 rounded-md text-xs text-white ${
                          emailStatus[query._id] === 'sending' ? 'bg-gray-400 cursor-not-allowed' :
                          emailStatus[query._id] === 'sent' ? 'bg-green-500' :
                          emailStatus[query._id] === 'error' ? 'bg-red-500' :
                          'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={emailStatus[query._id] === 'sending'}
                      >
                        {emailStatus[query._id] === 'sending' ? 'Sending...' :
                         emailStatus[query._id] === 'sent' ? 'Sent!' :
                         emailStatus[query._id] === 'error' ? 'Failed' :
                         'Send Email'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No queries found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Email Composition Modal */}
      {showEmailModal && currentQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compose Email Response</h3>
              <button 
                onClick={closeEmailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p><strong>To:</strong> {currentQuery.name} ({currentQuery.email})</p>
              <p><strong>Subject:</strong> Re: {currentQuery.subject}</p>
              <p><strong>Status:</strong> {currentQuery.status}</p>
            </div>
            
            <div className="mb-4 bg-gray-50 p-3 rounded">
              <p className="font-semibold">Original Query:</p>
              <p className="italic">{currentQuery.query}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Response:
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md min-h-32"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your response here..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeEmailModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={sendEmailNotification}
                disabled={!emailContent.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  !emailContent.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Queries;