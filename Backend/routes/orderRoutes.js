const express = require('express');
const router = express.Router();
const {
  createOrder,
  getChefOrders,
  acceptOrder,
  rejectOrder
} = require('../controllers/orderController');
const Order = require('../models/OrderSchema');
const auth = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/chef', auth, getChefOrders);
router.put('/chef/accept/:id', auth, acceptOrder);
router.put('/chef/reject/:id', auth, rejectOrder);
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('chef', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;