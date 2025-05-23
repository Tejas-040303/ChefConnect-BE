const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

// common side
const userReviewRoutes = require("./routes/Comman/userReviewRoutes");
const authRoutes = require("./routes/Comman/auth");
const { handleExpiredOrders } = require("./controllers/Chef/customerOrderController");

// user{Chef} side
const chefHProfileRoute = require("./routes/Chef/chefHProfileRoute");
const dishRoutes = require("./routes/Chef/dishRoutes");
const chefSideOrderRoutes = require("./routes/Chef/chefSideOrderRoutes");
const customerOrderRoutes = require("./routes/Chef/customerOrderRoutes");
const chefTrainingRoutes = require("./routes/Chef/chefTrainingRoutes");
const settingsRoutes = require("./routes/Chef/settingsRoutes");
const chefProfileRoutes = require("./routes/Chef/chefProfileRoutes");

// user{Customer} side
const customerProfileRoutes = require("./routes/Customer/customerProfileRoutes");
const customerDashboard = require("./routes/Customer/customerDashboard");
const chefDetailsRoutes = require("./routes/Customer/chefDetailsRoutes");
const customerSettingsRoutes = require("./routes/Customer/customerSettingsRoutes");
const orderedChefRoutes = require("./routes/Customer/orderedChefRoute"); // this is the one which is used for customer to order chef.
const reviewRoutes = require('./routes/Customer/reviewRoutes');
const paymentRoutes = require('./routes/Customer/paymentRoutes'); // this is the one which is used for customer to order chef.
const recommendationRoutes = require('./routes/Customer/recommendationRoutes');

// admin side
const adminRoute = require("./routes/Admin/adminRoute");
const adminTrackUserRoute = require("./routes/Admin/adminTrackUserRoute");
const adminTrackOrderRoute = require("./routes/Admin/adminTrackOrderRoute");
const adminExpenseSheetRoute = require("./routes/Admin/adminExpenseSheetRoute");
const chefTrainingRequestRoute = require("./routes/Admin/chefTrainingRequestRoute");
const complaintRoutes = require("./routes/Admin/complaintRoutes");
const queriesRoutes = require("./routes/Admin/queriesRoutes");

const chatRoute = require("./routes/chatRoute"); // to be worked on
const Complaint = require("./models/Admin/Complaint");

dotenv.config();
require("./config/db");
require("./models/Chef/OrderSchema");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const connections = new Map();
const orderSubscribers = new Map();
app.use(express.json());
app.use(cors());

// Comman routes
app.use("/comman/userreviews", userReviewRoutes);
app.use("/comman/auth", authRoutes);// it's in admin route folder as it is required there as well.
app.use("/api/chat", chatRoute); 

// Chef routes
app.use("/chef/chefprofile", chefProfileRoutes);
app.use("/chef/chefhprofile", chefHProfileRoute);
app.use("/chef/dishes", dishRoutes);  // not in any use for now
app.use("/chef/chefsideorder", chefSideOrderRoutes);
app.use("/chef/customerorder", customerOrderRoutes);
app.use("/chef/training", chefTrainingRoutes);
app.use("/chef/settings", settingsRoutes);

// Customer routes
app.use("/customer/customerprofile", customerProfileRoutes);
app.use("/customer/dashboard", customerDashboard);
app.use("/customer/chefdetails", chefDetailsRoutes);
app.use("/customer/cheforder", orderedChefRoutes);
app.use('/customer/payment', paymentRoutes);
app.use("/customer/settings", customerSettingsRoutes);
app.use('/customer/reviews', reviewRoutes);
app.use('/customer/recommendations', recommendationRoutes);

// admin routes
app.use("/admin", adminRoute);
app.use("/admin/track-user", adminTrackUserRoute);
app.use("/admin/track-order", adminTrackOrderRoute);
app.use("/admin/expense-sheet", adminExpenseSheetRoute);
app.use("/admin/cheftraining", chefTrainingRequestRoute);
app.use("/admin/queries", queriesRoutes);
app.use("/admin/complaints", complaintRoutes);


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
  handleExpiredOrders();
}, 60000);

// WebSocket connection
// Updated WebSocket code for app.js
// Add this at the top with your other imports

// Initialize WebSocket server and maps for connections and order subscribers
// Make these available globally and via app.locals

app.locals.connections = connections;
app.locals.orderSubscribers = orderSubscribers;
global.connections = connections;
global.orderSubscribers = orderSubscribers;

// WebSocket connection handler
wss.on('connection', (ws) => {
  let userId = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Authentication handling
      if (data.type === 'AUTHENTICATION' || data.type === 'AUTH') {
        userId = data.userId || (data.token ? extractUserIdFromToken(data.token) : null);
        
        if (userId) {
          connections.set(userId, ws);
          console.log(`User ${userId} connected via WebSocket`);
          // Store the userId directly on the websocket object for identification
          ws.userId = userId;
          sendPendingOrders(userId, ws);
        }
      }
      
      // Chat typing notification - only send to the intended recipient
      if (data.type === 'CHAT_TYPING') {
        const recipientId = data.recipientId;
        const recipientWs = connections.get(recipientId);
        
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({
            type: 'TYPING',
            chatId: data.chatId,
            userId: userId
          }));
        }
      }
      
      // Message read status handling
      if (data.type === 'MARK_READ') {
        handleMarkMessagesRead(userId, data.chatId);
      }
      
      // Global chat join handling
      if (data.type === 'JOIN_GLOBAL_CHAT') {
        console.log(`User ${userId} joined global chat`);
      }
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    if (userId) {
      connections.delete(userId);
      // Clean up any subscriptions
      for (const [orderId, subscribers] of orderSubscribers.entries()) {
        if (subscribers.has(ws)) {
          subscribers.delete(ws);
          if (subscribers.size === 0) {
            orderSubscribers.delete(orderId);
          }
        }
      }
      console.log(`User ${userId} disconnected`);
    }
  });
});

function extractUserIdFromToken(token) {
  try {
    // This is a placeholder - implement based on your token structure
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || decoded._id || decoded.userId;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

function broadcastPrivateMessage(senderId, recipientId, messageData) {
  const connections = global.connections;
  
  // Only send to the specific sender and recipient
  const senderWs = connections.get(senderId);
  const recipientWs = connections.get(recipientId);
  
  const message = {
    type: 'NEW_PRIVATE_MESSAGE',
    message: {
      ...messageData,
      sender: senderId,
      recipient: recipientId
    }
  };
  
  if (senderWs && senderWs.readyState === WebSocket.OPEN) {
    senderWs.send(JSON.stringify(message));
  }
  
  if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
    recipientWs.send(JSON.stringify(message));
  }
}

// Helper function to mark messages as read
async function handleMarkMessagesRead(userId, chatId) {
  try {
    const Chat = require('./models/Comman/chatSchema');
    await Chat.updateMany(
      { 
        _id: chatId,
        'messages.sender': { $ne: userId },
        'messages.read': false
      },
      { $set: { 'messages.$[elem].read': true } },
      { 
        arrayFilters: [{ 'elem.sender': { $ne: userId }, 'elem.read': false }],
        multi: true
      }
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

app.locals.connections = connections;
global.connections = app.locals.connections;

async function sendPendingOrders(userId, ws) {
  try {
    const Order = require('./models/Chef/OrderSchema');
    
    // Find pending orders for this chef
    const pendingOrders = await Order.find({
      chef: userId,
      status: 'Pending',
      timerExpiry: { $gt: new Date() }
    }).populate('customer', 'name email')
      .populate('dishes.dish', 'name price')
      .sort({ createdAt: -1 });
    
    // Send each pending order
    pendingOrders.forEach(order => {
      ws.send(JSON.stringify({
        type: 'NEW_ORDER',
        order
      }));
    });
  } catch (error) {
    console.error('Error sending pending orders via WebSocket:', error);
  }
}