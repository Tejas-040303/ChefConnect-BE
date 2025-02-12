const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require('http');
const WebSocket = require('ws');

// importing routes from routes folder
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const chefMinInfoRoutes = require("./routes/chefMinInfoRoutes");
const chefDetailsRoutes = require('./routes/chefDetailsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');

// import schemas from models folder
const Order = require("./models/OrderSchema");
const Chat = require("./models/ChatSchema");
const Message = require("./models/MessageSchema");

// importing middleware from middleware folder
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
require("./config/db");

const app = express();
const PORT = process.env.PORT;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store WebSocket connections
const connections = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (message) => handleWebSocketMessage(ws, message));
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'AUTH') {
      connections.set(data.userId, ws);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    for (let [userId, connection] of connections.entries()) {
      if (connection === ws) {
        connections.delete(userId);
        break;
      }
    }
  });
});

// Check for expired orders every minute
const checkExpiredOrders = async () => {
  try {
    const expiredOrders = await Order.find({
      status: 'Pending',
      timerExpiry: { $lte: new Date() }
    }).populate('customer chef');

    if (expiredOrders.length > 0) {
      await Order.updateMany(
        { _id: { $in: expiredOrders.map(o => o._id) } },
        { status: 'Cancelled' }
      );

      expiredOrders.forEach(order => {
        const chefWs = connections.get(order.chef._id.toString());
        if (chefWs) {
          chefWs.send(JSON.stringify({
            type: 'ORDER_UPDATE',
            order: { ...order.toObject(), status: 'Cancelled' }
          }));
        }
        const customerWs = connections.get(order.customer._id.toString());
        if (customerWs) {
          customerWs.send(JSON.stringify({
            type: 'ORDER_UPDATE',
            order: { ...order.toObject(), status: 'Cancelled' }
          }));
        }
      });
    }
  } catch (error) {
    console.error('Error checking expired orders:', error);
  }
};
setInterval(checkExpiredOrders, 60000);


// handling WebSocket messages
const handleWebSocketMessage = async (ws, message) => {
  try {
    const data = JSON.parse(message);
    
    if (data.type === 'AUTH') {
      connections.set(data.userId, ws);
    }
    else if (data.type === 'MESSAGE') {
      const { content, chatId, senderId } = data;
      
      // Save message to database
      const newMessage = await Message.create({
        sender: senderId,
        content,
        chat: chatId,
        readBy: [senderId]
      });

      // Update chat's latest message
      await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

      // Populate message with sender info
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email role')
        .populate('chat');

      // Get chat participants
      const chat = await Chat.findById(chatId).select('participants');
      const participants = chat.participants.map(p => p.toString());

      // Send message to all participants
      participants.forEach(userId => {
        const connection = connections.get(userId);
        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'MESSAGE',
            message: populatedMessage
          }));
        }
      });
    }
  } catch (error) {
    console.error('WebSocket error:', error);
  }
};

app.locals.wss = wss;
app.locals.connections = connections;

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);//Chef and Customer Profiles routes
app.use("/customer", chefMinInfoRoutes);
app.use('/customer/chef', chefDetailsRoutes);
app.use('/orders', orderRoutes);
app.use('/api/chats', chatRoutes);
app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));