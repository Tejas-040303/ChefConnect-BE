import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function UserConcerns() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [repliedFilter, setRepliedFilter] = useState('All');
  const [emailContent, setEmailContent] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [resolutionTimestamps, setResolutionTimestamps] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000);
    return () => clearInterval(timer)
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        if (activeTab === 'complaints') {
          const res = await axios.get('http://localhost:8080/admin/complaints/complaints', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const processedComplaints = res.data.map(complaint => ({
            ...complaint,
            status: complaint.status || 'Pending'
          }));
          const storedTimestamps = JSON.parse(localStorage.getItem('resolutionTimestamps') || '{}');
          setResolutionTimestamps(storedTimestamps);
          setComplaints(processedComplaints)
        } else {
          const res = await axios.get('http://localhost:8080/admin/complaints/messages', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(res.data)
        }
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false)
      }
    };
    fetchData()
  }, [activeTab]);

  const isTimedOut = (complaintId) => {
    if (!resolutionTimestamps[complaintId]) return false;
    const timeElapsed = currentTime - resolutionTimestamps[complaintId];
    return timeElapsed >= 300000
  };

  const getRemainingTime = (complaintId) => {
    if (!resolutionTimestamps[complaintId]) return { minutes: 0, seconds: 0 };
    const timeElapsed = currentTime - resolutionTimestamps[complaintId];
    const timeRemaining = Math.max(0, 300000 - timeElapsed);
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return { minutes, seconds }
  };

  const renderTimer = (complaintId) => {
    if (!resolutionTimestamps[complaintId]) return null;
    const { minutes, seconds } = getRemainingTime(complaintId);
    if (minutes === 0 && seconds === 0) {
      return (<span className="text-red-600 text-xs ml-2">Time expired</span>)
    }
    return (<span className="text-blue-600 text-xs ml-2">{minutes}:{seconds < 10 ? `0${seconds}` : seconds} left</span>)
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`http://localhost:8080/admin/complaints/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let updatedTimestamps = { ...resolutionTimestamps };
      if (status === 'Resolved') {
        updatedTimestamps[id] = Date.now();
        localStorage.setItem('resolutionTimestamps', JSON.stringify(updatedTimestamps))
      } else {
        if (updatedTimestamps[id]) {
          delete updatedTimestamps[id];
          localStorage.setItem('resolutionTimestamps', JSON.stringify(updatedTimestamps))
        }
      }
      setResolutionTimestamps(updatedTimestamps);
      setComplaints(complaints.map(c => c._id === id ? { ...c, status } : c));
      if (selectedComplaint?._id === id) {
        setSelectedComplaint({ ...selectedComplaint, status })
      }
    } catch (err) {
      console.error("Error updating complaint status:", err);
      setError(err.response?.data?.message || 'Failed to update status')
    }
  };

  const sendReply = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://localhost:8080/admin/complaints/messages/${selectedMessage._id}/reply`, { reply: replyContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the message in the state with all required flags
      setMessages(messages.map(m => m._id === selectedMessage._id ? {
        ...m,
        replied: true,
        replyMessage: replyContent,
        isReply: true,
        isRead: true
      } : m));
      
      setSelectedMessage({
        ...selectedMessage,
        replied: true,
        replyMessage: replyContent,
        isReply: true,
        isRead: true
      });
      
      setReplyContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply')
    }
  };

  const openEmailModal = (complaint) => {
    if (complaint.status === 'Resolved' && isTimedOut(complaint._id)) {
      return
    }
    setSelectedComplaint(complaint);
    setIsEmailModalOpen(true);
    setEmailContent('');
    setEmailSuccess(false)
  };

  const sendComplaintEmail = async () => {
    if (!emailContent.trim()) return;
    try {
      setEmailSending(true);
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://localhost:8080/admin/complaints/${selectedComplaint._id}/email`, { emailContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailSending(false);
      setEmailSuccess(true);
      setTimeout(() => {
        setEmailSuccess(false)
      }, 3000)
    } catch (err) {
      setEmailSending(false);
      setError(err.response?.data?.message || 'Failed to send email')
    }
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailContent('');
    setEmailSuccess(false)
  };

  const renderStatusBadge = (status) => {
    const displayStatus = status || 'Pending';
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        displayStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        displayStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
        'bg-green-100 text-green-800'
      }`}>{displayStatus}</span>
    )
  };

  const filteredComplaints = complaints.filter(c => statusFilter === 'All' || c.status === statusFilter);
  const filteredMessages = messages.filter(m => repliedFilter === 'All' || 
    (repliedFilter === 'Replied' && (m.replied || m.isReply)) || 
    (repliedFilter === 'Pending' && !(m.replied || m.isReply)));

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Concerns</h1>
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'complaints' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('complaints')}>Complaints</button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'messages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('messages')}>Messages</button>
      </div>

      {activeTab === 'complaints' ? (
        <div>
          <div className="mb-4">
            <label className="mr-2">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded">
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{complaint.user?.name}</div>
                        <div className="text-sm text-gray-500">{complaint.user?.email}</div>
                        <div className="text-sm text-gray-500">{complaint.user?.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{complaint.complaint}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(complaint.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <select
                          value={complaint.status || 'Pending'}
                          onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}
                          className="p-1 border rounded text-sm mr-2"
                          disabled={complaint.status === 'Resolved' && isTimedOut(complaint._id)}>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        {complaint.status === 'Resolved' && renderTimer(complaint._id)}
                        <button
                          onClick={() => openEmailModal(complaint)}
                          disabled={complaint.status === 'Resolved' && isTimedOut(complaint._id)}
                          className={`px-2 py-1 ${
                            complaint.status === 'Resolved' && isTimedOut(complaint._id) 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-indigo-500 hover:bg-indigo-600'
                          } text-white rounded text-sm ml-1`}>Email</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No complaints found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedComplaint && !isEmailModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Complaint Details</h3>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="text-gray-500 hover:text-gray-700">×</button>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">User Information</h4>
                    <p>Name: {selectedComplaint.user?.name}</p>
                    <p>Email: {selectedComplaint.user?.email}</p>
                    <p>Role: {selectedComplaint.user?.role}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">Complaint</h4>
                    <p className="whitespace-pre-wrap">{selectedComplaint.complaint}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <div className="flex items-center">
                      <select
                        value={selectedComplaint.status || 'Pending'}
                        onChange={(e) => updateComplaintStatus(selectedComplaint._id, e.target.value)}
                        className="p-2 border rounded"
                        disabled={selectedComplaint.status === 'Resolved' && isTimedOut(selectedComplaint._id)}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      {selectedComplaint.status === 'Resolved' && renderTimer(selectedComplaint._id)}
                    </div>
                    <button
                      onClick={() => { setSelectedComplaint(null); openEmailModal(selectedComplaint) }}
                      disabled={selectedComplaint.status === 'Resolved' && isTimedOut(selectedComplaint._id)}
                      className={`mt-2 px-3 py-2 ${
                        selectedComplaint.status === 'Resolved' && isTimedOut(selectedComplaint._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-500 hover:bg-indigo-600'
                      } text-white rounded`}>Contact User</button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted on: {format(new Date(selectedComplaint.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          )}
        
          {isEmailModalOpen && selectedComplaint && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Contact User</h3>
                    <button
                      onClick={closeEmailModal}
                      className="text-gray-500 hover:text-gray-700">×</button>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">Sending to:</h4>
                    <p>{selectedComplaint.user?.name} ({selectedComplaint.user?.email})</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">Regarding Complaint:</h4>
                    <p className="text-sm text-gray-700 truncate">
                      {selectedComplaint.complaint.substring(0, 100)}
                      {selectedComplaint.complaint.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Email Content:</h4>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="w-full p-3 border rounded"
                      rows="6"
                      placeholder="Write your email content here..." />
                    <p className="text-xs text-gray-500 mt-1">Note: Subject and other email details will be automatically generated.</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={closeEmailModal}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Cancel</button>
                    <div>
                      {emailSuccess && (
                        <span className="text-green-600 mr-3">Email sent successfully!</span>
                      )}
                      <button
                        onClick={sendComplaintEmail}
                        disabled={!emailContent.trim() || emailSending}
                        className={`px-4 py-2 rounded text-white ${
                          !emailContent.trim() || emailSending 
                            ? 'bg-gray-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}>
                        {emailSending ? 'Sending...' : 'Send Email'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="mr-2">Filter by status:</label>
            <select
              value={repliedFilter}
              onChange={(e) => setRepliedFilter(e.target.value)}
              className="p-2 border rounded">
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Replied">Replied</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map(message => (
                    <tr key={message._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{message.user?.name}</div>
                        <div className="text-sm text-gray-500">{message.user?.email}</div>
                        <div className="text-sm text-gray-500">{message.user?.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{message.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          message.replied || message.isReply
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.replied || message.isReply ? 'Replied' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="text-blue-600 hover:text-blue-900">
                          {message.replied || message.isReply ? 'View' : 'Reply'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No messages found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">
                      {selectedMessage.replied || selectedMessage.isReply ? 'Message Details' : 'Reply to Message'}
                    </h3>
                    <button
                      onClick={() => { setSelectedMessage(null); setReplyContent('') }}
                      className="text-gray-500 hover:text-gray-700">×</button>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">User Information</h4>
                    <p>Name: {selectedMessage.user?.name}</p>
                    <p>Email: {selectedMessage.user?.email}</p>
                    <p>Role: {selectedMessage.user?.role}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">Original Message</h4>
                    <p className="whitespace-pre-wrap mb-4 p-3 bg-gray-50 rounded">{selectedMessage.message}</p>
                  </div>

                  {(selectedMessage.replied || selectedMessage.isReply) ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">Your Reply</h4>
                      <p className="whitespace-pre-wrap p-3 bg-blue-50 rounded border border-blue-100">
                        {selectedMessage.replyMessage}
                      </p>
                      <div className="text-green-600 mt-2">This message has been replied to.</div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Reply</h4>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                        rows="4"
                        placeholder="Type your response here..." />
                      <button
                        onClick={sendReply}
                        disabled={!replyContent.trim()}
                        className={`px-4 py-2 rounded text-white ${
                          !replyContent.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}>Send Reply</button>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 mt-4">
                    Received on: {format(new Date(selectedMessage.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserConcerns