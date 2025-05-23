const Order = require("../../models/Chef/OrderSchema");
const { sendOrderStatusEmail } = require("../../services/emailService");
const { generateOrderStatusEmail } = require("../../utils/emailTemplates");

const chefSideOrderController = {
  getChefOrders: async (req, res) => {
    try {
      const chefId = req.user.id || req.user.user_id;
      console.log("Chef ID from token:", chefId);
      
      const orders = await Order.find({
        chef: chefId,
        $or: [
          { status: { $in: ["Pending", "Confirmed"] }},
          { 
            status: "Completed", 
            paymentStatus: { $in: ["Pending", "Awaiting Verification"] }
          }
        ]
      })
      .populate("customer", "name email")
      .populate("dishes.dish")
      .sort({ orderDate: -1 });
      
      return res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      console.error("Error getting chef orders:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },
  
  getChefOrderHistory: async (req, res) => {
    try {
      const chefId = req.user.id || req.user.user_id;
      
      const orders = await Order.find({
        chef: chefId,
        $or: [
          { status: { $in: ["Rejected", "Expired"] }},
          { status: "Completed", paymentStatus: "Completed" }
        ]
      })
      .populate("customer", "name email")
      .populate("dishes.dish")
      .sort({ orderDate: -1 });
      
      return res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      console.error("Error getting chef order history:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },
  
  markPaymentReceived: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentMethod } = req.body;
      
      const validPaymentMethods = ['Cash', 'QR Code', 'UPI'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method"
        });
      }
      
      const chefId = req.user.id || req.user.user_id;
      
      // Updated to also match orders with "Awaiting Verification" payment status
      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          chef: chefId,
          status: "Completed",
          isPaid: false,
          paymentStatus: { $in: ["Pending", "Awaiting Verification"] }
        },
        { 
          isPaid: true,
          paymentStatus: "Completed",
          paymentMethod: paymentMethod
        },
        { new: true }
      )
      .populate("customer", "name email")
      .populate("chef", "name")
      .populate("dishes.dish", "name price");
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be updated"
        });
      }
      
      // Send email to customer about payment confirmation
      try {
        const emailContent = generateOrderStatusEmail({
          customerName: order.customer.name,
          chefName: order.chef.name,
          orderDetails: order.dishes,
          status: "Payment Completed",
          orderId: order._id,
          paymentMethod: paymentMethod
        });
        
        await sendOrderStatusEmail(
          order.customer.email,
          "Payment Confirmed for Your ChefConnect Order",
          emailContent
        );
        
        console.log(`Payment confirmation email sent to ${order.customer.email}`);
      } catch (emailError) {
        console.error("Error sending payment confirmation email:", emailError);
      }
      
      // Notify customer through WebSocket if available
      const customerWs = req.app.locals.connections?.get(order.customer._id.toString());
      if (customerWs) {
        customerWs.send(JSON.stringify({
          type: "ORDER_UPDATE",
          order
        }));
      }
      
      return res.status(200).json({
        success: true,
        message: "Payment marked as received successfully",
        order
      });
    } catch (error) {
      console.error("Error marking payment received:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },
  
  markOrderCompleted: async (req, res) => {
    try {
      const { orderId } = req.params;
      const chefId = req.user.id || req.user.user_id;
      
      const order = await Order.findOne({
        _id: orderId,
        chef: chefId,
        status: "Confirmed"
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be completed"
        });
      }
      
      order.status = "Completed";
      await order.save();
      
      const populatedOrder = await Order.findById(order._id)
        .populate("customer", "name email")
        .populate("chef", "name")
        .populate("dishes.dish", "name price");
      
      // Send completion email to customer
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
        
        console.log(`Completion email sent to ${populatedOrder.customer.email}`);
      } catch (emailError) {
        console.error("Error sending completion email:", emailError);
      }
      
      // Notify customer through WebSocket if available
      const customerWs = req.app.locals.connections?.get(order.customer.toString());
      if (customerWs) {
        customerWs.send(JSON.stringify({
          type: "ORDER_UPDATE",
          order: populatedOrder
        }));
      }
      
      return res.status(200).json({
        success: true,
        message: "Order marked as completed successfully"
      });
    } catch (error) {
      console.error("Error completing order:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  // Add this method to handle order acceptance
  acceptOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const chefId = req.user.id || req.user.user_id;
      
      const order = await Order.findOneAndUpdate(
        { _id: orderId, chef: chefId, status: "Pending" },
        { status: "Confirmed" },
        { new: true }
      )
        .populate("customer", "name email")
        .populate("chef", "name")
        .populate("dishes.dish", "name price");
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be accepted"
        });
      }
      
      // Send order acceptance email
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
        
        console.log(`Acceptance email sent to ${order.customer.email}`);
      } catch (emailError) {
        console.error("Error sending acceptance email:", emailError);
      }
      
      // WebSocket notification
      const customerWs = req.app.locals.connections?.get(order.customer._id.toString());
      if (customerWs) {
        customerWs.send(JSON.stringify({
          type: "ORDER_UPDATE",
          order
        }));
      }
      
      return res.status(200).json({
        success: true,
        message: "Order accepted successfully",
        order
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
  
  // Add this method to handle order rejection
  rejectOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const chefId = req.user.id || req.user.user_id;
      
      const order = await Order.findOneAndUpdate(
        { _id: orderId, chef: chefId, status: "Pending" },
        { status: "Rejected" },
        { new: true }
      )
        .populate("customer", "name email")
        .populate("chef", "name")
        .populate("dishes.dish", "name price");
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be rejected"
        });
      }
      
      // Send order rejection email
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
        
        console.log(`Rejection email sent to ${order.customer.email}`);
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
      
      // WebSocket notification
      const customerWs = req.app.locals.connections?.get(order.customer._id.toString());
      if (customerWs) {
        customerWs.send(JSON.stringify({
          type: "ORDER_UPDATE",
          order
        }));
      }
      
      return res.status(200).json({
        success: true,
        message: "Order rejected successfully",
        order
      });
    } catch (error) {
      console.error("Error rejecting order:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
  
  // Add a method to handle expired orders
  handleExpiredOrders: async () => {
    try {
      // Find orders that have expired but haven't been marked as such
      const expiredOrders = await Order.find({
        status: "Pending",
        timerExpiry: { $lt: new Date() },
        expiredEmailSent: { $ne: true }
      })
        .populate("customer", "name email")
        .populate("chef", "name")
        .populate("dishes.dish", "name price");
      
      console.log(`Found ${expiredOrders.length} expired orders to process`);
      
      for (const order of expiredOrders) {
        // Update order status
        order.status = "Expired";
        order.expiredEmailSent = true;
        await order.save();
        
        // Send expiration email
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
          
          console.log(`Expiration email sent to ${order.customer.email}`);
        } catch (emailError) {
          console.error("Error sending expiration email:", emailError);
        }
        
        // WebSocket notification
        if (global.connections) {
          const customerWs = global.connections.get(order.customer._id.toString());
          if (customerWs) {
            customerWs.send(JSON.stringify({
              type: "ORDER_UPDATE",
              order
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error handling expired orders:", error);
    }
  }
};

module.exports = chefSideOrderController;