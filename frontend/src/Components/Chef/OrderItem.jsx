import React, { useState } from "react";

import { FaRupeeSign } from "react-icons/fa";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: "bg-yellow-200 text-yellow-800",
    Confirmed: "bg-blue-200 text-blue-800",
    Completed: "bg-green-200 text-green-800",
    default: "bg-gray-200 text-gray-800"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.default}`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const paymentStatusStyles = {
    Pending: "bg-orange-200 text-orange-800",
    "Awaiting Verification": "bg-yellow-200 text-yellow-800",
    Completed: "bg-green-200 text-green-800",
    Failed: "bg-red-200 text-red-800",
    Refunded: "bg-purple-200 text-purple-800",
    default: "bg-gray-200 text-gray-800"
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        paymentStatusStyles[status] || paymentStatusStyles.default
      }`}
    >
      Payment: {status}
    </span>
  );
};

const PaymentModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Confirm Payment Received</h3>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {["Cash", "QR Code", "UPI"].map((method) => (
              <button
                key={method}
                type="button"
                className={`py-2 px-4 border rounded-md transition ${
                  paymentMethod === method
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(orderId, paymentMethod)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ order, onComplete, onPaymentReceived }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const orderIdShort = order._id.substring(order._id.length - 6);
  const formattedDate = new Date(order.selectedDate).toLocaleDateString();
  const timeSlot = `${order.selectedTimeSlot.startTime} - ${order.selectedTimeSlot.endTime}`;
  
  return (
    <div className="border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm bg-gray-100 rounded px-2 py-1">#{orderIdShort}</span>
          <h3 className="font-semibold">{order.customer.name}</h3>
        </div>
        <div className="flex space-x-2">
          <StatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-3">
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
              <span>
                <FaRupeeSign className="inline-block text-xs mb-1" />
                {order.total}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Delivery Information</h4>
          <div className="bg-gray-50 p-3 rounded-md space-y-1">
            <p className="text-sm">
              <span className="text-gray-500">Address: </span>
              {order.deliveryAddress}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Date: </span>
              {formattedDate}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Time: </span>
              {timeSlot}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Payment Method: </span>
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        {/* Show "Mark as Completed" button only for Confirmed orders */}
        {order.status === "Confirmed" && (
          <button
            onClick={() => onComplete(order._id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium w-full transition-colors"
          >
            Mark as Completed
          </button>
        )}
        
        {/* Show "Verify Payment" button only for Completed orders with Awaiting Verification payment status */}
        {order.status === "Completed" && order.paymentStatus === "Awaiting Verification" && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium w-full transition-colors"
          >
            Verify Payment
          </button>
        )}
        
        {/* Show completed status message for fully completed orders */}
        {order.status === "Completed" && order.paymentStatus === "Completed" && (
          <div className="p-2 bg-green-50 border border-green-100 text-green-700 rounded-md text-center">
            Order completed and payment received via {order.paymentMethod}
          </div>
        )}
      </div>
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={onPaymentReceived}
        orderId={order._id}
      />
    </div>
  );
};

export default OrderItem;