// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';

// const Order = () => {
//   const [orders, setOrders] = useState([]);
//   const [now, setNow] = useState(new Date());
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await axios.get('http://localhost:8080/orders/chef', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setOrders(response.data.orders);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       }
//     };

//     fetchOrders();

//     const ws = new WebSocket('ws://localhost:8080');
//     ws.onopen = () => {
//       const token = localStorage.getItem('token');
//       const { user_id } = jwtDecode(token);
//       ws.send(JSON.stringify({ type: 'AUTH', userId: user_id }));
//     };

//     ws.onmessage = (message) => {
//       const data = JSON.parse(message.data);
//       if (data.type === 'NEW_ORDER') {
//         setOrders(prev => [data.order, ...prev]);
//       } else if (data.type === 'ORDER_UPDATE') {
//         setOrders(prev => prev.filter(order => order._id !== data.order._id));
//       }
//     };

//     const timer = setInterval(() => setNow(new Date()), 1000);

//     return () => {
//       ws.close();
//       clearInterval(timer);
//     };
//   }, []);

//   const handleAccept = async (orderId) => {
//     try {
//       await axios.put(`http://localhost:8080/orders/chef/accept/${orderId}`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setOrders(prev => prev.filter(order => order._id !== orderId));
//     } catch (error) {
//       console.error('Error accepting order:', error);
//     }
//   };

//   const handleReject = async (orderId) => {
//     try {
//       await axios.put(`http://localhost:8080/orders/chef/reject/${orderId}`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setOrders(prev => prev.filter(order => order._id !== orderId));
//     } catch (error) {
//       console.error('Error rejecting order:', error);
//     }
//   };

//   const calculateTimeLeft = (timerExpiry) => {
//     const expiry = new Date(timerExpiry);
//     const difference = expiry - now;
//     if (difference <= 0) return 'Expired';
//     const minutes = Math.floor((difference / 1000 / 60) % 60);
//     const seconds = Math.floor((difference / 1000) % 60);
//     return `${minutes}m ${seconds}s`;
//   };

//   return (
//     <div className="order-container">
//       <h2>Pending Orders</h2>
//       {orders.length === 0 ? (
//         <p>No pending orders</p>
//       ) : (
//         orders.map(order => (
//           <div key={order._id} className="order-card">
//             <div className="order-header">
//               <h3>Order from {order.customer?.name}</h3>
//               <div className="timer">
//                 Time remaining: {calculateTimeLeft(order.timerExpiry)}
//               </div>
//             </div>
//             <div className="order-details">
//               <p>Dishes: {order.dishes.map(d => d.name).join(', ')}</p>
//               <p>People: {order.numberOfPeople}</p>
//               <p>Total: ${order.totalBill}</p>
//             </div>
//             <div className="order-actions">
//               <button onClick={() => handleAccept(order._id)} className="btn-accept">
//                 Accept
//               </button>
//               <button onClick={() => handleReject(order._id)} className="btn-reject">
//                 Reject
//               </button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Order;


import React from 'react';

function Orders() {
  return ( 
    <div className="order-container">
      <h2>Orders Page</h2>
      <p>This is the Orders page</p>
    </div>
   );
}

export default Orders;