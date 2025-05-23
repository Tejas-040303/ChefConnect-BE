// controllers/Chef/customerOrderController.js
const Order = require("../../models/Chef/OrderSchema");
const { sendOrderStatusEmail } = require("../../services/emailService");
const { generateOrderStatusEmail } = require("../../utils/emailTemplates");

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
    if (orders && orders.length > 0) {
      for (const order of orders) {
        notifyChef(req, order);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const orderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      chef: req.user._id,
      $or: [
        { status: "Completed", paymentStatus: "Completed" },
        { status: "Rejected" },
        { status: "Expired" }
      ]
    })
      .populate("customer", "name")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      order.chef._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to view this order"
      });
    }

    res.json(order);
  } catch (error) {
    console.error("Error in order detail route:", error);
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
      .populate("chef", "name")
      .populate("dishes.dish", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Send email to customer
    try {
      const emailContent = generateOrderStatusEmail({
        customerName: order.customer.name,
        chefName: order.chef.name,
        orderDetails: order.dishes,
        status: "Confirmed",
        orderId: order._id
      });

      await sendOrderStatusEmail(
        order.customer.email,
        "Your ChefConnect Order Has Been Accepted",
        emailContent
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue with the process even if email fails
    }

    // Notify customer via WebSocket
    const customerWs = req.app.locals.connections.get(order.customer._id.toString());
    if (customerWs) {
      customerWs.send(JSON.stringify({
        type: "ORDER_UPDATE",
        order
      }));
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
      .populate("chef", "name")
      .populate("dishes.dish", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Send email to customer
    try {
      const emailContent = generateOrderStatusEmail({
        customerName: order.customer.name,
        chefName: order.chef.name,
        orderDetails: order.dishes,
        status: "Rejected",
        orderId: order._id
      });

      await sendOrderStatusEmail(
        order.customer.email,
        "Your ChefConnect Order Has Been Rejected",
        emailContent
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue with the process even if email fails
    }

    // Notify customer via WebSocket
    const customerWs = req.app.locals.connections.get(order.customer._id.toString());
    if (customerWs) {
      customerWs.send(JSON.stringify({
        type: "ORDER_UPDATE",
        order
      }));
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.chef.toString() !== req.user._id) {
      return res.status(403).json({
        message: "Not authorized to update this order"
      });
    }

    if (order.status !== "Confirmed") {
      return res.status(400).json({
        message: "Can only complete confirmed orders"
      });
    }

    order.status = "Completed";
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");

    // Send email to customer
    try {
      const emailContent = generateOrderStatusEmail({
        customerName: populatedOrder.customer.name,
        chefName: populatedOrder.chef.name,
        orderDetails: populatedOrder.dishes,
        status: "Completed",
        orderId: populatedOrder._id
      });

      await sendOrderStatusEmail(
        populatedOrder.customer.email,
        "Your ChefConnect Order Has Been Completed",
        emailContent
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue with the process even if email fails
    }

    // Notify customer via WebSocket
    const customerWs = req.app.locals.connections.get(order.customer.toString());
    if (customerWs) {
      customerWs.send(JSON.stringify({
        type: "ORDER_UPDATE",
        order: populatedOrder,
      }));
    }

    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to handle expired orders
const handleExpiredOrders = async (app) => {
  try {
    const expiredOrders = await Order.find({
      status: "Pending",
      timerExpiry: { $lt: new Date() },
      expiredEmailSent: { $ne: true }
    })
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");

    for (const order of expiredOrders) {
      // Send email to customer about expired order
      try {
        const emailContent = generateOrderStatusEmail({
          customerName: order.customer.name,
          chefName: order.chef.name,
          orderDetails: order.dishes,
          status: "Expired",
          orderId: order._id
        });

        await sendOrderStatusEmail(
          order.customer.email,
          "Your ChefConnect Order Has Expired",
          emailContent
        );

        // Mark that we've sent an expired notification
        order.expiredEmailSent = true;
        order.status = "Expired";
        await order.save();

        // Notify customer via WebSocket
        const customerWs = req.app.locals.connections.get(order.customer._id.toString());
        if (customerWs) {
          customerWs.send(JSON.stringify({
            type: "ORDER_UPDATE",
            order
          }));
        }
      } catch (emailError) {
        console.error("Error sending expired order email:", emailError);
      }
    }
  } catch (error) {
    console.error("Error handling expired orders:", error);
  }
};

const notifyChef = async (req, order) => {
  try {
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('dishes.dish', 'name price');
    
    const chefWs = req.app.locals.connections.get(order.chef.toString());
    if (chefWs) {
      chefWs.send(JSON.stringify({
        type: 'NEW_ORDER',
        order: populatedOrder
      }));
    }
  } catch (error) {
    console.error('Error notifying chef of new order:', error);
  }
};

module.exports = {
  getChefOrders,
  orderHistory,
  getOrderDetails,
  acceptOrder,
  rejectOrder,
  completeOrder,
  handleExpiredOrders
};