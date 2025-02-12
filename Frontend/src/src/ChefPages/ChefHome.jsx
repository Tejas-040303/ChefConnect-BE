// ChefHome.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import LeftNavBar from '../ChefComponents/LeftNavBar';
import DashBoard from '../ChefComponents/DashBoard';
import Order from '../ChefComponents/Order';
import ChefProfile from '../ChefComponents/ChefProfile ';
import Settings from '../ChefComponents/Settings';
import '../../public/css/ChefCss/ChefHome.css'
function ChefHome() {
    const [orders, setOrders] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');
        
        ws.current.onmessage = (e) => {
          const message = JSON.parse(e.data);
          if (message.type === 'ORDER_UPDATE') {
            setOrders(prev => prev.filter(order => order._id !== message.order._id));
          }
        };
      
        return () => {
            if (ws.readyState === 1) { // <-- This is important
                ws.close();
            }
        };
    }, []);

    return (
        <div className="chef-container" style={{ height: "100vh" }}>
            <div className="chef-container-items">
                {/* Left Navbar */}
                <div className="chef-container-item-one">
                    <LeftNavBar />
                </div>
                {/* Main Content */}
                <div className="chef-container-item-two">
                    <Routes>
                        <Route path="/dashboard" element={<DashBoard />} />
                        <Route path="/orders" element={<Order />} />
                        <Route path="/profile" element={<ChefProfile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route
                            path="*"
                            element={
                                <div className="right-display">
                                    <h2>Welcome to the Chef Dashboard!</h2>
                                    <p>Select an option from the left menu to view details.</p>
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default ChefHome;
