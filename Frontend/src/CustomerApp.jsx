import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNavbar from './CustomerComponents/Navbar/BottomNavbar';
import Home from './CustomerPages/Home';
import DashBoard from './CustomerPages/DashBoard';
import Booking from './CustomerPages/Booking';
import History from './CustomerPages/History';
import Profile from './CustomerPages/Profile';
import Payment from './CustomerPages/Payment';
import SingleChefContainer from './CustomerComponents/DashBoard/SingleChefContainer';

function CustomerApp() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashBoard />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/order-history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard/single-chef" element={<SingleChefContainer />} />
                {/* Dynamic Route for Payment */}
                <Route path="/payment/:chefId" element={<Payment />} />
            </Routes>
            <BottomNavbar />
        </>
    );
}

export default CustomerApp;
