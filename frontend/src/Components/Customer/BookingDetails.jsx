import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaRupeeSign } from "react-icons/fa";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [chefDetails, setChefDetails] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState(null);

  const wsRef = useRef(null);

  const fetchQRCode = async (chefId) => {
    try {
      if (!chefId) {
        console.log("No chef ID provided for QR code");
        return;
      }

      setQrCodeLoading(true);
      setQrCodeError(null);

      const token = localStorage.getItem("token");
      console.log(`Fetching QR code for chef: ${chefId}`);

      const response = await axios.get(
        `http://localhost:8080/customer/chefdetails/${chefId}/qrcode`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("QR code API response:", response.data);

      if (response.data && response.data.qrCodeUrl) {
        console.log("Setting QR code URL:", response.data.qrCodeUrl);
        setQrCodeUrl(response.data.qrCodeUrl);

        // Update chef details with payment info if available
        setChefDetails(prevDetails => ({
          ...prevDetails,
          upiId: response.data.upiId || prevDetails?.upiId,
          paymentPhoneNumber: response.data.paymentPhoneNumber || prevDetails?.paymentPhoneNumber
        }));
      } else {
        console.error("QR code URL not found in response");
        setQrCodeError("QR code not available");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error.response?.data || error.message);
      setQrCodeError("Failed to load QR code");
    } finally {
      setQrCodeLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      setError("You are not logged in. Please log in to view your order.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/customer/cheforder/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);

        // Change from /customer/chef/ to /customer/chefdetails/
        const chefResponse = await axios.get(`http://localhost:8080/customer/chefdetails/${response.data.chef._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChefDetails(chefResponse.data);

        // Call fetchQRCode after getting chef details
        if (response.data.chef._id) {
          fetchQRCode(response.data.chef._id);
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to load order details.");
        setLoading(false);
      }
    };

    fetchOrder();
    fetchQRCode(order?.chef?._id);

    wsRef.current = new WebSocket("ws://localhost:8080");
    wsRef.current.onopen = () => {
      setTimeout(() => {
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.id || decoded._id;
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "AUTH", userId }));
          }
        } catch (err) {
          console.error("Error sending WebSocket message:", err);
        }
      }, 100);
    };

    wsRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "ORDER_UPDATE" && data.order._id === id) {
        setOrder(data.order);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket closed");

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      wsRef.current?.close();
      clearInterval(timer);
    };
  }, [id]);

  const handlePaymentMethodChange = async (e) => {

    if (order.isPaid) {
      return;
    }
    const newPaymentMethod = e.target.value;
    try {
      const token = localStorage.getItem("token");
      setOrder((prev) => ({
        ...prev,
        paymentMethod: newPaymentMethod,
      }));

      await axios.put(
        `http://localhost:8080/customer/cheforder/${id}/payment`,
        { paymentMethod: newPaymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating payment method:", error.response?.data || error.message);
      setOrder((prev) => ({
        ...prev,
        paymentMethod: prev.paymentMethod,
      }));
    }
  };

  const handleGoToBookings = () => navigate("/customer/bookings");
  const handlePayNow = () => navigate(`/customer/payment/${id}`);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mx-auto"></div>
          <p className="text-amber-800 font-medium mt-4">Loading your booking details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/customer/bookings")}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-amber-500 text-5xl mb-4">❓</div>
          <h2 className="text-xl font-medium text-gray-800">Order not found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
          <button
            onClick={() => navigate("/customer/bookings")}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
          ),
        };
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              ></path>
            </svg>
          ),
        };
      case "Cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              ></path>
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              ></path>
            </svg>
          ),
        };
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          ),
        };
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: (
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          ),
        };
    }
  };

  const statusInfo = getStatusColor(order.status);
  const paymentStatusInfo = getPaymentStatusColor(order.paymentStatus);

  // Helper function to render payment method details
  const renderPaymentMethodDetails = () => {
    if (!chefDetails) return null;

    switch (order.paymentMethod) {
      case "QR Code":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-700 mb-2">Scan QR Code to Pay</p>
            <div className="flex justify-center">
              {qrCodeLoading ? (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
                </div>
              ) : qrCodeUrl ? (
                <div className="relative">
                  <img
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain"
                    onLoad={() => console.log("QR code image loaded successfully")}
                    onError={(e) => {
                      console.error("QR code image failed to load:", qrCodeUrl);
                      setQrCodeError("Could not load QR code image");
                      e.target.style.display = 'none';
                    }}
                  />
                  {qrCodeError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
                      <div className="text-red-500 text-center p-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                        </svg>
                        <p>{qrCodeError}</p>
                        <button
                          className="mt-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                          onClick={() => fetchQRCode(order.chef._id)}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : qrCodeError ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
                  <svg className="w-12 h-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-red-500 mb-2">{qrCodeError}</p>
                  <button
                    className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                    onClick={() => fetchQRCode(order.chef._id)}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Payment information section */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-amber-800 mb-2">Payment Information</h4>
              {chefDetails.upiId && (
                <div className="flex justify-between items-center mb-2 bg-white p-2 rounded">
                  <span className="text-gray-600">UPI ID:</span>
                  <span className="font-medium text-gray-900">{chefDetails.upiId}</span>
                </div>
              )}
              {chefDetails.paymentPhoneNumber && (
                <div className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{chefDetails.paymentPhoneNumber}</span>
                </div>
              )}
              {!chefDetails.upiId && !chefDetails.paymentPhoneNumber && (
                <p className="text-yellow-700">No additional payment details available</p>
              )}
            </div>
          </div>
        );

      case "UPI":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">UPI Payment Details</h4>
            {chefDetails.upiId && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">UPI ID:</span>
                <span className="font-medium text-gray-900">{chefDetails.upiId}</span>
              </div>
            )}
            {chefDetails.paymentPhoneNumber && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium text-gray-900">{chefDetails.paymentPhoneNumber}</span>
              </div>
            )}
            {!chefDetails.upiId && !chefDetails.paymentPhoneNumber && (
              <p className="text-yellow-700 text-center">UPI details not available</p>
            )}
          </div>
        );
      case "Cash":
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-700">Payment will be collected in cash upon delivery</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-amber-600 px-6 py-8 text-white relative">
            <button
              onClick={handleGoToBookings}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Back to bookings"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-center">Booking Details</h2>
            <p className="text-center mt-2 text-amber-100">Thank you for your reservation!</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className={`flex items-center rounded-full px-4 py-1.5 ${statusInfo.bg} ${statusInfo.text} font-medium text-sm`}>
                {statusInfo.icon}
                Status: {order.status}
              </div>
              {timeLeft > 0 && order.status === "Confirmed" && (
                <div className="flex items-center rounded-full px-4 py-1.5 bg-blue-100 text-blue-800 font-medium text-sm">
                  <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Edit window: {minutes}m {seconds}s
                </div>
              )}
            </div>
          </div>
          <div className="p-6 md:p-8">
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <h3 className="text-2xl font-semibold text-gray-800">Booking Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-500 mb-2">Customer</div>
                  <div className="font-semibold text-lg text-gray-900">{order.customer?.name}</div>
                  <div className="mt-4">
                    <div className="font-medium text-gray-500 mb-2">Delivery Address</div>
                    <div className="text-gray-900">{order.deliveryAddress}</div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-500 mb-2">Chef</div>
                  <div className="font-semibold text-lg text-gray-900">{order.chef?.name}</div>
                  <div className="mt-4">
                    <div className="font-medium text-gray-500 mb-2">Date & Time</div>
                    <div className="text-gray-900">
                      {formatDate(order.selectedDate)}
                      <br />
                      {order.selectedTimeSlot?.startTime} - {order.selectedTimeSlot?.endTime}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="font-medium text-amber-800 mb-2">Order Details</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Dishes:</span>
                      <span className="text-gray-900 text-right font-medium">
                        {order.dishes?.map((d, index) => (
                          <div key={index}>
                            {d.dish?.name} (x{d.quantity})
                          </div>
                        ))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Number of People:</span>
                      <span className="text-gray-900 font-medium">{order.numberOfPeople}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Diet:</span>
                      <span className="text-gray-900 font-medium">{order.diet}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Allergies:</span>
                      <span className="text-gray-900 text-right font-medium">
                        {order.allergies?.length > 0 ? order.allergies.join(", ") : "None"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="font-medium text-amber-800 mb-2">Status Information</div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className={`flex items-center rounded-full px-3 py-1 text-sm ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.icon}
                        Status: {order.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-amber-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z"></path>
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd">
                  </path>
                </svg>
                <h3 className="text-2xl font-semibold text-gray-800">Payment Details
                </h3>
              </div>

              <div className="p-6 bg-white border-2 border-amber-100 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className={`flex items-center mr-3 rounded-full px-3 py-1 text-sm ${order.isPaid ? "bg-green-100 text-green-800" : paymentStatusInfo.bg + " " + paymentStatusInfo.text}`}>
                      {order.isPaid ? (
                        <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        paymentStatusInfo.icon
                      )}
                      {order.paymentStatus}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    <FaRupeeSign className="inline-block text-xs mb-1" />
                    {order.total}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method {order.isPaid && <span className="text-green-600 ml-2">(Finalized)</span>}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Cash", "QR Code", "UPI"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${order.paymentMethod === method
                          ? order.isPaid
                            ? "border-green-500 bg-green-50 shadow-md opacity-80"
                            : "border-amber-500 bg-amber-50 shadow-md"
                          : order.isPaid
                            ? "border-gray-200 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-amber-300"
                          }`}
                      >
                        <input
                          type="radio"
                          value={method}
                          checked={order.paymentMethod === method}
                          onChange={handlePaymentMethodChange}
                          disabled={order.isPaid}
                          className="sr-only"
                        />
                        <div className="text-center">
                          {method === "Cash" && (
                            <svg
                              className={`w-8 h-8 mx-auto mb-1 ${order.paymentMethod === method
                                ? order.isPaid ? "text-green-600" : "text-amber-600"
                                : "text-gray-400"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          )}
                          {method === "QR Code" && (
                            <svg
                              className={`w-8 h-8 mx-auto mb-1 ${order.paymentMethod === method
                                ? order.isPaid ? "text-green-600" : "text-amber-600"
                                : "text-gray-400"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                                clipRule="evenodd"
                              ></path>
                              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"></path>
                            </svg>
                          )}
                          {method === "UPI" && (
                            <svg
                              className={`w-8 h-8 mx-auto mb-1 ${order.paymentMethod === method
                                ? order.isPaid ? "text-green-600" : "text-amber-600"
                                : "text-gray-400"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 010 2H10a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              ></path>
                              <path d="M11 12a1 1 0 11-2 0 1 1 0 012 0z"></path>
                            </svg>
                          )}
                          <span
                            className={`font-medium ${order.paymentMethod === method
                              ? order.isPaid ? "text-green-700" : "text-amber-700"
                              : "text-gray-700"
                              }`}
                          >
                            {method}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {renderPaymentMethodDetails()}
                {order.paymentStatus !== "Paid" && !order.isPaid && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handlePayNow}
                      className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"></path>
                      </svg>
                      Confirm Payment
                    </button>
                  </div>
                )}
                {order.isPaid && (
                  <div className="mt-8 flex justify-center">
                    <div className="px-8 py-3 bg-green-100 text-green-800 font-medium rounded-lg flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"></path>
                      </svg>
                      Payment Completed
                    </div>
                  </div>
                )}
              </div>
            </section>

            {order.specialInstructions && (
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-6 h-6 text-amber-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-800">Special Instructions</h3>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{order.specialInstructions}</p>
                </div>
              </section>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={handleGoToBookings}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Back to Bookings
              </button>

              {order.status === "Confirmed" && timeLeft > 0 && (
                <button
                  onClick={() => navigate(`/customer/edit-booking/${id}`)}
                  className="px-6 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                  </svg>
                  Edit Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;