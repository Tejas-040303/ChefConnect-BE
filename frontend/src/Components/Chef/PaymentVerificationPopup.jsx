import React from 'react';
import axios from 'axios';

const PaymentVerificationPopup = ({ payment, onClose, onVerified }) => {
  const handleVerifyPayment = async (verified) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/customer/cheforder/verify_chef_payment',
        {
          orderId: payment._id,
          verified
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        onVerified(response.data.order);
        onClose();
      } else {
        console.error('Verification failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-amber-500 p-4 text-white">
          <h2 className="text-lg font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment Verification Required
          </h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              <span className="font-medium text-gray-800">{payment.customerName}</span> has confirmed a payment for their booking.
              Please verify if you have received the payment.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-800 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-amber-700">₹{payment.total}</span>
              </div>
              <div className="text-amber-800 text-sm">
                Payment Method: <span className="font-medium">{payment.paymentMethod}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking Date:</span>
              <span className="font-medium">{formatDate(payment.selectedDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Slot:</span>
              <span className="font-medium">{payment.selectedTimeSlot?.startTime}-{payment.selectedTimeSlot?.endTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Number of People:</span>
              <span className="font-medium">{payment.numberOfPeople}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Reference:</span>
              <span className="font-medium">#{payment._id.substring(payment._id.length-6)}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => handleVerifyPayment(true)} 
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment Received
            </button>
            
            <button 
              onClick={() => handleVerifyPayment(false)}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Not Received
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationPopup;