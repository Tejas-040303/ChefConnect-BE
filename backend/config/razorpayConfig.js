const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your-env-key-for-razorpay-key-id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your-env-key-for-razorpay-key-secret',
});

module.exports = razorpayInstance;