const Order = require("../../models/Chef/OrderSchema");
const Dish = require("../../models/Chef/DishSchema");

// Get all orders with optional filters
const getAllOrders = async (req, res) => {
  try {
    const { status, chefId, customerId, date } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (chefId) filters.chef = chefId;
    if (customerId) filters.customer = customerId;
    if (date) filters.selectedDate = new Date(date);

    const orders = await Order.find(filters)
      .populate({
        path: "customer",
        select: "name email"
      })
      .populate({
        path: "chef",
        select: "name email"
      })
      .populate({
        path: "dishes.dish",
        model: "Dish",
        select: "name price description category subCategory"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .populate({
        path: "customer",
        select: "name email"
      })
      .populate({
        path: "chef",
        select: "name email"
      })
      .populate({
        path: "dishes.dish",
        model: "Dish",
        select: "name price description category subCategory"
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getAllOrders, updateOrderStatus };