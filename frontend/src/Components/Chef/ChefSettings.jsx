import React, { useState } from 'react';
import axios from 'axios';

function ChefSettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [complaint, setComplaint] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8080/chef/settings/password', passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating password');
    }
  };

  const handleDeleteRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/chef/settings/delete-request', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Account deletion request submitted');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting deletion request');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/chef/settings/complaint', { complaint }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Complaint submitted successfully');
      setComplaint('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting complaint');
    }
  };

  const handleContactAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/chef/settings/contact-admin', { message: contactMessage }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Message sent to admin');
      setContactMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending message');
    }
  };

  return (
    <div className="text-amber-500 p-8 mx-8">
      <h2 className="text-2xl sm:text-3xl text-red-600 font-bold py-2">Setting</h2>

      {/* Password Change Section */}
      <div className="mb-6 mx-4 bg-white/30 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-3">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="w-full p-3 border rounded text-black"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full p-3 border rounded text-black"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full p-3 border rounded text-black"
            required
          />
          <button
            type="submit"
            className="bg-amber-500 text-white px-6 py-3 rounded hover:bg-amber-600"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Account Deletion Request */}
      <div className="mb-6 mx-4 bg-white/30 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-3">Request Account Deletion</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
        >
          Request Deletion
        </button>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white/30 p-8 rounded-lg shadow-lg text-black">
              <h4 className="text-lg font-bold mb-4">Confirm Deletion Request</h4>
              <p className="mb-6">
                Are you sure you want to request account deletion? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteRequest();
                    setShowModal(false);
                  }}
                  className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Submission */}
      <div className="mb-6 mx-4 bg-white/30 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-3">Submit a Complaint</h3>
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <textarea
            placeholder="Describe your complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full p-3 border rounded text-black"
            rows="4"
            required
          />
          <button
            type="submit"
            className="bg-amber-500 text-white px-6 py-3 rounded hover:bg-amber-600"
          >
            Submit Complaint
          </button>
        </form>
      </div>

      {/* Contact Admin */}
      <div className="mb-6 mx-4 bg-white/30 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-3">Contact Admin</h3>
        <form onSubmit={handleContactAdmin} className="space-y-4">
          <textarea
            placeholder="Your message to admin"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            className="w-full p-3 border rounded text-black"
            rows="4"
            required
          />
          <button
            type="submit"
            className="bg-amber-500 text-white px-6 py-3 rounded hover:bg-amber-600"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Feedback Message */}
      {message && <p className="mt-6 mx-4 text-green-500">{message}</p>}
    </div>
  );
}

export default ChefSettings;