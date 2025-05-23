const Order = require("../../models/Chef/OrderSchema");

const orderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");
      
    if (!order) return res.status(404).json({ message: "Order not found" });
        // For debugging
        console.log('Order:', order._id);
        console.log('Customer ID from order:', order.customer._id.toString());
        console.log('Authenticated user ID:', req.user._id.toString());
        console.log('Chef ID from order:', order.chef._id.toString());
        
    // Check if the user requesting is either the customer or chef for this order
    if (order.customer._id.toString() !== req.user._id && 
        order.chef._id.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// have to remove this
const customerBooking = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
      status: { $in: ['Pending', 'Confirmed'] }
    })
      .populate('chef', 'name email')
      .populate('dishes.dish', 'name price')
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customersss bookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};

module.exports = {
  orderDetail,
  customerBooking
};