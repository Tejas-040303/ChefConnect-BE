import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { FaPizzaSlice, FaCarrot, FaAppleAlt } from 'react-icons/fa';
import { GiCupcake, GiFrenchFries, GiNoodles } from 'react-icons/gi';
import Home from "../../Components/Chef/Home";
import LeftNavBar from "../../Components/Chef/LeftNavBar";
import DashBoard from "../../Components/Chef/DashBoard";
import Order from "../../Components/Chef/Order";
import History from "../../Components/Chef/History";
import ChefDashboardProfile from "../../Components/Chef/ChefDashboardProfile";
import ChatPage from "../../Components/Chef/ChatPage";
import ChefTraining  from "../../Components/Chef/ChefTraining";
import ChefSettings from "../../Components/Chef/ChefSettings";
import PaymentVerificationPopup from "../../Components/Chef/PaymentVerificationPopup";

function ChefHome() {
  const [foodIcons, setFoodIcons] = useState([]);
  const [paymentNotification, setPaymentNotification] = useState(null);

  useEffect(() => {
    const icons = Array(15).fill().map((_, i) => {
      const icons = [FaPizzaSlice, FaCarrot, FaAppleAlt, GiCupcake, GiFrenchFries, GiNoodles];
      const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
      return {
        id: i,
        Icon: RandomIcon,
        size: Math.random() * 2.5 + 2,
        left: `${Math.random() * 90 + 5}%`,
        top: `${Math.random() * 80 + 10}%`,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.35 + 0.05,
      };
    });
    setFoodIcons(icons);
  }, []);

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Setup WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      // Send authentication on connection
      ws.send(JSON.stringify({
        type: 'AUTH',
        token
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle payment notification
        if (data.type === 'PAYMENT_NOTIFICATION') {
          setPaymentNotification(data.order);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Clean up WebSocket connection
    return () => {
      ws.close();
    };
  }, []);

  const handlePaymentVerified = (order) => {
    // You could update some local state or show a success message here
    console.log('Payment verified:', order);
    // Possibly refresh some data if needed
  };

  return (
    <div className="min-h-screen flex text-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 -z-10"></div>
      
      {foodIcons.map((item) => (
        <div
          key={item.id}
          className="absolute text-white animate-float -z-5"
          style={{
            left: item.left,
            top: item.top,
            opacity: item.opacity,
            animation: `float ${item.duration}s infinite linear`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.size}rem`,
            transform: 'translateY(0px)',
            pointerEvents: 'none',
          }}>
          <item.Icon />
        </div>
      ))}
      
      <LeftNavBar />
      
      <div className="flex-1 p-5 relative">
        <Routes>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/order" element={<Order />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/training" element={<ChefTraining />} />
          <Route path="/profile" element={<ChefDashboardProfile />} />
          <Route path="/setting" element={<ChefSettings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      
      {paymentNotification && (
        <PaymentVerificationPopup 
          payment={paymentNotification}
          onClose={() => setPaymentNotification(null)}
          onVerified={handlePaymentVerified}
        />
      )}
      
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-120px) rotate(180deg);
          }
          100% {
            transform: translateY(-240px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default ChefHome;