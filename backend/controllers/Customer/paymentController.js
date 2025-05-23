const Order = require('../../models/Chef/OrderSchema');
const asyncHandler = require('express-async-handler');

// Original Razorpay controllers (keeping them for reference)
const createOrder = asyncHandler(async (req, res) => {
  const { orderId, orderAmount } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to make payment for this order' 
      });
    }
    
    if (order.isPaid) {
      return res.status(400).json({ 
        success: false, 
        message: 'This order has already been paid' 
      });
    }
    
    // Create a simple order ID (removed Razorpay integration)
    const orderRef = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    order.paymentStatus = 'Processing';
    await order.save();
    
    res.status(200).json({
      success: true,
      razorpayOrderId: orderRef,
      amount: orderAmount
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order', 
      error: error.message 
    });
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to verify this payment' 
      });
    }
    
    order.paymentStatus = 'Completed';
    order.isPaid = true;
    await order.save();
    
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment', 
      error: error.message 
    });
  }
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId)
      .select('paymentStatus isPaid total')
      .populate('chef', 'name');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to access this order' 
      });
    }
    
    res.status(200).json({
      success: true,
      payment: {
        status: order.paymentStatus,
        isPaid: order.isPaid,
        amount: order.total
      }
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment details', 
      error: error.message 
    });
  }
});

// New direct payment flow controllers
const directPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to make payment for this order' 
      });
    }
    
    if (order.isPaid) {
      return res.status(400).json({ 
        success: false, 
        message: 'This order has already been paid' 
      });
    }
    
    // Update payment status to awaiting verification
    order.paymentStatus = 'Awaiting Verification';
    order.paymentMethod = paymentMethod || order.paymentMethod;
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment initiated, waiting for chef verification',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error processing direct payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment', 
      error: error.message 
    });
  }
});

const notifyChefPayment = asyncHandler(async (req, res) => {
  const { orderId, chefId } = req.body;
  try {
    const order = await Order.findById(orderId)
      .populate('customer', 'name')
      .populate('chef', 'name');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to notify for this order' 
      });
    }
    
    // Send notification to chef via WebSocket
    const ws = req.app.locals.connections.get(chefId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'PAYMENT_NOTIFICATION',
        order: {
          _id: order._id,
          customerName: order.customer.name,
          total: order.total,
          paymentMethod: order.paymentMethod,
          orderDate: order.orderDate,
          selectedDate: order.selectedDate,
          selectedTimeSlot: order.selectedTimeSlot,
          numberOfPeople: order.numberOfPeople
        }
      }));
      
      res.status(200).json({
        success: true,
        message: 'Chef has been notified about your payment'
      });
    } else {
      // Chef is offline, but we'll update the order anyway
      res.status(200).json({
        success: true,
        message: 'Payment recorded, but chef is currently offline. They will be notified when they come online.'
      });
    }
  } catch (error) {
    console.error('Error notifying chef:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to notify chef', 
      error: error.message 
    });
  }
});

const verifyChefPayment = asyncHandler(async (req, res) => {
  const { orderId, verified } = req.body;
  
  try {
    const order = await Order.findById(orderId)
      .populate('customer', 'name')
      .populate('chef', 'name');
      
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.chef._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this payment'
      });
    }
    
    if (verified) {
      order.paymentStatus = 'Completed';
      order.isPaid = true;
    } else {
      order.paymentStatus = 'Rejected';
    }
    
    await order.save();
    
    // Access connections and orderSubscribers from the app.locals or global objects
    const connections = req.app.locals.connections;
    const orderSubscribers = req.app.locals.orderSubscribers || global.orderSubscribers;
    
    // Notify the customer via their personal WebSocket
    const customerWs = connections.get(order.customer._id.toString());
    if (customerWs && customerWs.readyState === 1) { // 1 = WebSocket.OPEN
      customerWs.send(JSON.stringify({
        type: 'PAYMENT_VERIFICATION',
        verified,
        orderId: order._id,
        message: verified 
          ? 'Your payment has been verified by the chef' 
          : 'Your payment claim was rejected by the chef. Please contact them directly.'
      }));
    }
    
    // Notify all subscribers to this order (includes the payment page)
    if (orderSubscribers && orderSubscribers.has(orderId)) {
      const subscribers = orderSubscribers.get(orderId);
      if (subscribers && subscribers.size > 0) {
        const message = JSON.stringify({
          type: 'PAYMENT_VERIFICATION',
          verified,
          orderId: order._id,
          message: verified
            ? 'Payment has been verified by the chef'
            : 'Payment verification was rejected by the chef.'
        });
        
        subscribers.forEach(sub => {
          if (sub.readyState === 1) { // 1 = WebSocket.OPEN
            sub.send(message);
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: verified ? 'Payment verified successfully' : 'Payment verification rejected',
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid
      }
    });
  } catch (error) {
    console.error('Error verifying chef payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  directPayment,
  notifyChefPayment,
  verifyChefPayment
};