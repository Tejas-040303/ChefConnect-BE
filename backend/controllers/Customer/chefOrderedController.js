const Order = require("../../models/Chef/OrderSchema");

const getChefOrders = async (req, res) => {
  try {
    await Order.updateMany(
      {
        chef: req.user.user_id,
        status: "Pending",
        timerExpiry: { $lt: new Date() },
      },
      { status: "Cancelled" }
    );
    const orders = await Order.find({
      chef: req.user.user_id,
      status: "Pending",
      timerExpiry: { $gt: new Date() },
    })
      .populate("customer", "name email")
      .populate("dishes.dish", "name price")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Confirmed" },
      { new: true }
    )
      .populate("customer", "name email")
      .populate("dishes.dish", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const customerWs = req.app.locals.connections.get(order.customer._id.toString());
    if (customerWs) {
      customerWs.send(JSON.stringify({ type: "ORDER_UPDATE", order }));
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
      { status: "Rejected" },
      { new: true }
    )
      .populate("customer", "name email")
      .populate("dishes.dish", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const customerWs = req.app.locals.connections.get(order.customer._id.toString());
    if (customerWs) {
      customerWs.send(JSON.stringify({ type: "ORDER_UPDATE", order }));
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getChefOrders, acceptOrder, rejectOrder };