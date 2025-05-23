// src/Pages/Chef/ChefHome.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { FaPizzaSlice, FaCarrot, FaAppleAlt } from 'react-icons/fa';
import { GiCupcake, GiFrenchFries, GiNoodles } from 'react-icons/gi';

import Home from '../../Components/Customer/Home';
import CustomerDashboard from '../../Components/Customer/CustomerDashboard';
import ChefCompleteDetails from '../../Components/Customer/ChefCompleteDetails';
import BookThisChef from '../../Components/Customer/BookThisChef';
import BookingConfirmation from '../../Components/Customer/BookingConfirmation';
import Payment from '../../Components/Customer/Payment';
import BookingDetails from '../../Components/Customer/BookingDetails';
import Bookings from '../../Components/Customer/Bookings';
import OrderHistoryDetails from '../../Components/Customer/OrderHistoryDetails';
import ChatPage from '../../Components/Customer/ChatPage';
import CustomerSettings from "../../Components/Customer/CustomerSettings";
import CustomerProfile from "../../Components/Customer/CustomerProfile";
import BottomNavBar from "../../Components/Customer/BottomNavBar";


function CustomerHome() {
    const [foodIcons, setFoodIcons] = useState([]);

    useEffect(() => {
        // Generate random food icons for the animated background
        const icons = Array(15).fill().map((_, i) => {
            const icons = [FaPizzaSlice, FaCarrot, FaAppleAlt, GiCupcake, GiFrenchFries, GiNoodles];
            const RandomIcon = icons[Math.floor(Math.random() * icons.length)];

            return {
                id: i,
                Icon: RandomIcon,
                size: Math.random() * 2.5 + 2, // Increased size between 2-4.5rem
                left: `${Math.random() * 90 + 5}%`, // Position left 5-95%
                top: `${Math.random() * 80 + 10}%`, // Position top 10-90%
                duration: 15 + Math.random() * 20, // Animation duration 15-35s
                delay: Math.random() * 5, // Delay animation start 0-5s
                opacity: Math.random() * 0.35 + 0.05, // Opacity between 0.05-0.4
            };
        });

        setFoodIcons(icons);
    }, []);

    return (
        <div className="min-h-screen flex text-black relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 -z-10"></div>

            {/* Animated Background Elements */}
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
                        pointerEvents: 'none', // Make sure they don't interfere with clicking
                    }}
                >
                    <item.Icon />
                </div>
            ))}

            {/* bottom Navigation Bar */}
            <BottomNavBar />
            {/* Main Content Area */}
            <div className="flex-1 relative">
                <Routes>

                    {/* Home route */}
                    <Route path="/" element={<Home />} />

                    {/* Dashboard route */}
                    <Route path="/dashboard" element={<CustomerDashboard />} />

                    {/* ChefCompleteDetails route */}
                    <Route path="/ChefCompleteDetails/:id" element={<ChefCompleteDetails />} />

                    {/* Order Form route */}
                    <Route path="/BookThisChef/:id" element={<BookThisChef />} />

                    {/* Confirmation route */}
                    <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

                    {/* Payment Confirmation route */}
                    <Route path="/payment/:id" element={<Payment />} />

                    {/* Booking route */}
                    <Route path="/booking/:id" element={<BookingDetails />} />
                    <Route path="/bookings" element={<Bookings />} />

                    {/* Order History route */}
                    <Route path="/order-history" element={<OrderHistoryDetails />} />

                    {/* Community route */}
                    <Route path="/chat" element={<ChatPage />} />

                    {/* CustomerProfile route */}
                    <Route path="/profile" element={<CustomerProfile />} />

                    {/* Customer Settings route */}
                    <Route path="/settings" element={<CustomerSettings />} />

                    {/* Catch-all route (when nothing else matches) */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </div>

            {/* Add CSS animation */}
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

export default CustomerHome;