const Order = require('../models/OrderSchema');
const Chef = require('../models/ChefSchema');
const Customer = require('../models/CustomerSchema');

const createOrder = async (req, res) => {
  try {
    const { chefId, dishes, numberOfPeople, selectedDay, selectedHours, totalBill } = req.body;
    const timerExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    const order = new Order({
      customer: req.user.user_id,
      chef: chefId,
      dishes,
      numberOfPeople,
      selectedDay,
      selectedHours,
      totalBill,
      timerExpiry
    });

    await order.save();
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('chef', 'name');

    const ws = req.app.locals.connections.get(chefId);
    if (ws) {
      ws.send(JSON.stringify({ type: 'NEW_ORDER', order: populatedOrder }));
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChefOrders = async (req, res) => {
  try {
    await Order.updateMany(
      { chef: req.user.user_id, status: 'Pending', timerExpiry: { $lt: new Date() } },
      { status: 'Cancelled' }
    );
    console.log(req.params.id)
    const orders = await Order.find({ 
      chef: req.user.user_id,
      status: 'Pending',
      timerExpiry: { $gt: new Date() }
    })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });
    console.log(orders);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed' },
      { new: true }
    )
    .populate('customer', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const ws = req.app.locals.connections.get(order.customer._id.toString());
    if (ws) {
      ws.send(JSON.stringify({ type: 'ORDER_UPDATE', order }));
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    )
    .populate('customer', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const ws = req.app.locals.connections.get(order.customer._id.toString());
    if (ws) {
      ws.send(JSON.stringify({ type: 'ORDER_UPDATE', order }));
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createOrder, getChefOrders, acceptOrder, rejectOrder };