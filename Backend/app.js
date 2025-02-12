const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require('http');
const WebSocket = require('ws');
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/ProfileRoutes");
const chefMinInfoRoutes = require("./routes/chefMinInfoRoutes");
const chefDetailsRoutes = require('./routes/chefDetailsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require("./middleware/errorHandler");
const Order = require("./models/OrderSchema");

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

app.locals.wss = wss;
app.locals.connections = connections;

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);//Chef and Customer Profiles routes
app.use("/customer", chefMinInfoRoutes);
app.use('/customer/chef', chefDetailsRoutes);
app.use('/orders', orderRoutes);

app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));