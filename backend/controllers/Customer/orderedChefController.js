const Order = require("../../models/Chef/OrderSchema");

const createOrder = async (req, res) => {
  try {
    const { chefId, dishes, numberOfPeople, selectedDate, selectedTimeSlot, deliveryAddress, diet, allergies, total } = req.body;
    const timerExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const order = new Order({
      customer: req.user._id || req.user.user_id || req.user.id,
      chef: chefId,
      dishes,
      numberOfPeople,
      selectedDate: new Date(selectedDate),
      selectedTimeSlot,
      deliveryAddress,
      diet,
      allergies,
      total,
      status: "Pending",
      customerStatus: "Pending",
      chefStatus: "Pending",
      timerExpiry,
      orderDate: new Date(),
      paymentMethod: "Cash",
    });
    await order.save();
    const populatedOrder = await Order.findById(order._id).populate("customer", "name email").populate("chef", "name").populate("dishes.dish", "name price");
    const ws = req.app.locals.connections.get(chefId);
    if (ws) {
      ws.send(JSON.stringify({ type: "NEW_ORDER", order: populatedOrder }));
    }
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const customerBooking = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
      $or: [
        // Include pending and confirmed orders
        { status: { $in: ["Pending", "Confirmed"] } },
        // Include completed orders that haven't been fully paid yet
        { status: "Completed", paymentStatus: { $ne: "Completed" } }
      ]
    })
      .populate("chef", "name email")
      .populate("dishes.dish", "name price")
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const orderHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const orders = await Order.find({
      customer: req.user._id,
      $or: [
        // Only include Completed orders that are also fully paid
        { status: "Completed", paymentStatus: "Completed" },
        // Include rejected and expired orders regardless of payment
        { status: "Rejected" },
        { status: "Expired" }
      ]
    })
      .populate("chef", "name")
      .sort({ orderDate: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error("Error in order history route:", error);
    res.status(500).json({ message: error.message || "Failed to fetch order history" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email").populate("chef", "name").populate("dishes.dish", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Important: Check if the logged-in user is either the customer or chef for this order
    if (order.customer._id.toString() !== req.user._id.toString() && order.chef._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error in order detail route:", error);
    res.status(500).json({ message: error.message });
  }
};

const expireOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params._id);
    const customerId = String(order.customer._id || order.customer);
    const userId = String(req.user._id || req.user.id);
    if (customerId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be expired" });
    }

    const expiry = new Date(order.timerExpiry);
    const bufferMs = 2000; // 2 seconds of tolerance
    if (new Date().getTime() + bufferMs < expiry.getTime()) {
      return res.status(400).json({ message: "Order timer has not expired yet" });
    }

    order.status = "Expired";
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("customer", "name email").populate("chef", "name").populate("dishes.dish", "name price");

    const chefWs = req.app.locals.connections.get(order.chef.toString());
    if (chefWs) {
      chefWs.send(
        JSON.stringify({
          type: "ORDER_UPDATE",
          order: populatedOrder,
        })
      );
    }

    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const { paymentMethod, paymentStatus, isPaid } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Fix the ID comparison - convert both to strings
    const customerId = String(order.customer);
    const userId = String(req.user._id || req.user.id);
    
    if (customerId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }
    
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.isPaid = isPaid !== undefined ? isPaid : order.isPaid;
    
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");
      
    const chefWs = req.app.locals.connections.get(order.chef.toString());
    if (chefWs) {
      chefWs.send(JSON.stringify({
        type: "ORDER_UPDATE",
        order: populatedOrder,
      }));
    }
    
    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createOrder, customerBooking, orderHistory, getOrderDetails, expireOrder, paymentStatus };
