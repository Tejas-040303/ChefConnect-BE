const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/validate');
const { 
  createOrder, 
  verifyPayment, 
  getPaymentDetails,
  directPayment,
  notifyChefPayment,
  verifyChefPayment
} = require('../../controllers/Customer/paymentController');

router.post('/create_order', protect, createOrder);
router.post('/verify_payment', protect, verifyPayment);
router.get('/:id/payment', protect, getPaymentDetails);

// New routes for direct payment flow
router.post('/direct_payment', protect, directPayment);
router.post('/notify_payment', protect, notifyChefPayment);
router.post('/verify_chef_payment', protect, verifyChefPayment);

module.exports = router;