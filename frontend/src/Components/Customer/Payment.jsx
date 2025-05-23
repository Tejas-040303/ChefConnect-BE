import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingReviewModal from './RatingReviewModal';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [paymentVerificationStatus, setPaymentVerificationStatus] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const pollingTimerRef = useRef(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not logged in. Please log in to proceed with payment.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:8080/customer/cheforder/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrder(response.data);
        
        if (response.data.paymentStatus === 'Completed' && response.data.isPaid) {
          setPaymentSuccess(true);
        } else if (response.data.paymentStatus === 'Awaiting Verification') {
          setPaymentVerificationStatus('pending');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load payment details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
    
    return () => {
      // Clear polling timer when component unmounts
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [id]);

  // Set up a polling timer to check payment status if not already paid
  useEffect(() => {
    if (!order || paymentSuccess || order.isPaid) {
      // Don't need polling if already paid or payment successful
      return;
    }
    
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`http://localhost:8080/customer/cheforder/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If payment status has changed to paid, reload the page
        if (response.data.isPaid && !order.isPaid) {
          console.log('Payment status changed to paid, reloading page...');
          window.location.reload();
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    };
    
    // Poll every 10 seconds to check payment status
    pollingTimerRef.current = setInterval(checkPaymentStatus, 10000);
    
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [order, paymentSuccess, id]);

  useEffect(() => {
    if (!order || paymentSuccess) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setWsConnected(true);
      
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'AUTHENTICATION',
        token
      }));
      
      // Join order-specific updates
      ws.send(JSON.stringify({
        type: 'JOIN_ORDER',
        orderId: id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'PAYMENT_VERIFICATION' && data.orderId === id) {
          console.log('Payment verification update received:', data);
          
          if (data.verified) {
            setPaymentSuccess(true);
            setPaymentVerificationStatus('verified');
            setShowRatingModal(true);
            setOrder(prevOrder => ({
              ...prevOrder,
              paymentStatus: 'Completed',
              isPaid: true
            }));
          } else {
            setPaymentVerificationStatus('rejected');
            setPaymentSuccess(false);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setWsConnected(false);
    };

    return () => {
      console.log('Closing WebSocket connection');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [order, paymentSuccess, id]);

  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in to proceed with payment.');
        setPaymentProcessing(false);
        return;
      }
      
      const paymentResponse = await axios.post(
        'http://localhost:8080/customer/payment/direct_payment',
        {
          orderId: order._id,
          paymentMethod: order.paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paymentResponse.data.success) {
        const notifyChefResponse = await axios.post(
          'http://localhost:8080/customer/payment/notify_payment',
          {
            orderId: order._id,
            chefId: order.chef._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (notifyChefResponse.data.success) {
          setPaymentVerificationStatus('pending');
          setOrder(prevOrder => ({
            ...prevOrder,
            paymentStatus: 'Awaiting Verification'
          }));
        } else {
          console.error('Chef notification failed:', notifyChefResponse.data.message);
        }
      } else {
        setError('Payment processing failed. Please try again later.');
      }
    } catch (err) {
      console.error('Payment error:', err.response?.data || err.message);
      setError('Payment processing failed. Please try again later.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleRatingSubmit = async (rating, review) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/customer/reviews`,
        {
          chefId: order.chef._id,
          orderId: order._id,
          rating,
          review
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate(`/customer/booking/${id}`);
    } catch (err) {
      console.error('Review submission error:', err.response?.data || err.message);
      alert('Failed to submit review. We\'ll redirect you to your booking.');
      navigate(`/customer/booking/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-100">
        <div className="flex items-center text-red-600 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium">Error</h3>
        </div>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => navigate('/customer/bookings')}
          className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors w-full">
          Back to Bookings
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-lg border border-yellow-100">
        <div className="flex items-center text-yellow-600 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium">Order Not Found</h3>
        </div>
        <p className="text-gray-700">We couldn't find the order you're trying to pay for.</p>
        <button
          onClick={() => navigate('/customer/bookings')}
          className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors w-full">
          Back to Bookings
        </button>
      </div>
    );
  }

  const chefName = order.chef?.name || 'Unknown Chef';

  return (
    <div className="p-6 max-w-2xl mx-auto mb-16">
      <RatingReviewModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          navigate(`/customer/booking/${id}`);
        }}
        onSubmit={handleRatingSubmit}
        chefName={chefName}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">Booking with {chefName}</p>
        {wsConnected && (
          <p className="text-xs text-green-600 mt-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Connected for real-time updates
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              <p className="text-gray-500">Order #{order._id.substring(order._id.length - 6)}</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              {order.status}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Chef</span>
              <span className="font-medium">{chefName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">
                {new Date(order.selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{order.selectedTimeSlot?.startTime} - {order.selectedTimeSlot?.endTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Number of People</span>
              <span className="font-medium">{order.numberOfPeople}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${order.isPaid ? "text-green-600" : "text-amber-600"}`}>
                {order.isPaid ? "Paid" : order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-amber-600">₹{order.total}</span>
            </div>
          </div>

          {paymentSuccess || order.isPaid ? (
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-green-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-800 font-medium">Payment Confirmed Successfully!</p>
              <p className="text-gray-600 mt-2">Please rate your experience with {chefName}</p>
              <button
                onClick={() => setShowRatingModal(true)}
                className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors">
                Rate Your Experience
              </button>
            </div>
          ) : paymentVerificationStatus === 'pending' ? (
            <div className="bg-amber-50 p-4 rounded-lg mb-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-amber-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-amber-800 font-medium">Payment Confirmation Sent!</p>
              <p className="text-gray-600 mt-2">Waiting for {chefName} to verify your payment.</p>
              <p className="text-gray-500 mt-2 text-sm">This page will automatically update once the chef confirms your payment.</p>
            </div>
          ) : paymentVerificationStatus === 'rejected' ? (
            <div className="bg-red-50 p-4 rounded-lg mb-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-red-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">Payment Verification Failed</p>
              <p className="text-gray-600 mt-2">{chefName} couldn't verify your payment. Please contact them directly or try again.</p>
              <button
                onClick={handlePayment}
                className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors">
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className={`bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center ${
                  paymentProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Confirm the Payment of (₹{order.total})
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate(`/customer/bookings`)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;