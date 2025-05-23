import React, { useState } from 'react';
import axios from 'axios'; // Import axios

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer', // Default value for dropdown
    subject: '',
    phone: '',
    query: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // State for success/error message

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.query.trim()) newErrors.query = 'Query is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:8080/admin/queries', formData);
        if (response.status === 201) {
          setMessage({
            type: 'success',
            text: 'Thank you for your query! We’ll get back to you soon.',
          });
          setFormData({
            name: '',
            email: '',
            role: 'Customer',
            subject: '',
            phone: '',
            query: '',
          });
        } else {
          setMessage({
            type: 'error',
            text: 'Failed to submit query. Please try again.',
          });
        }
      } catch (error) {
        console.error('Error submitting query:', error);
        setMessage({
          type: 'error',
          text: 'An error occurred while submitting the query. Please try again later.',
        });
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Clear message after a few seconds (e.g., 5 seconds)
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer); // Cleanup on unmount or message change
    }
  }, [message]);

  return (
    <div className="contact-container">
      <form
        onSubmit={handleSubmit}
        className="contact-form bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto transform transition-all duration-300 hover:shadow-lg"
      >
        {/* Name Field - Label and Input on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="name" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Name:
          </label>
          <div className="w-3/4">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Email Field - Label and Input on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="email" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Email:
          </label>
          <div className="w-3/4">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Phone Number Field - Label and Input on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="phone" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Phone Number:
          </label>
          <div className="w-3/4">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
              placeholder="+1234567890"
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Subject Field - Label and Input on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="subject" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Subject:
          </label>
          <div className="w-3/4">
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
              required
            />
          </div>
        </div>

        {/* Role Field - Label and Select on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="role" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Sending Query as:
          </label>
          <div className="w-3/4">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
            >
              <option value="Customer">Customer</option>
              <option value="Chef">Chef</option>
              <option value="Anonymous">Anonymous</option>
            </select>
          </div>
        </div>

        {/* Query Field - Label and Textarea on Single Line */}
        <div className="form-group mb-4 flex items-center gap-4">
          <label htmlFor="query" className="text-orange-600 font-medium w-1/4 min-w-[100px] text-right">
            Query:
          </label>
          <div className="w-3/4">
            <textarea
              id="query"
              name="query"
              value={formData.query}
              onChange={handleChange}
              className="form-control w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-300"
              rows="4"
              required
            />
            {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-blue-500 hover:via-purple-800 hover:to-green-500 transition-colors duration-300 w-full mt-4"
        >
          Submit
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50`}
        >
          <div
            className={`p-4 rounded-lg shadow-lg max-w-md w-full mx-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            <p className="text-center">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="mt-2 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactUs;