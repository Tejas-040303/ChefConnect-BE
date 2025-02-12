import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNavbar from './CustomerComponents/Navbar/BottomNavbar';
import Home from './CustomerPages/Home';
import DashBoard from './CustomerPages/DashBoard';
import Booking from './CustomerPages/Booking';
import History from './CustomerPages/History';
import Community from './CustomerPages/Community';
import Profile from './CustomerPages/Profile';
import SingleChefContainer from './CustomerComponents/DashBoard/SingleChefContainer';
import ChefPreview from './CustomerComponents/DashBoard/ChefPreview';
import ChefBooking from './CustomerComponents/DashBoard/ChefBooking'; // Add this import
import BookingConfirmation from './CustomerComponents/DashBoard/BookingConfirmation';

function CustomerApp() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashBoard />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/order-history" element={<History />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard/single-chef" element={<SingleChefContainer />} />
                <Route path="/chef-profile/:id" element={<ChefPreview />} />
                <Route path="/booking/:chefId" element={<ChefBooking />} />
                <Route path="/booking-confirmation/:orderId" element={<BookingConfirmation />} />
            </Routes>
            <BottomNavbar />
        </>
    );
}

export default CustomerApp;