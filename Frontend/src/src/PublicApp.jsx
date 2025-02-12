import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './CommanComponents/Common/Navbar';
import Footer from './CommanComponents/Common/Footer';
import Home from './CommanPages/Home';
import AboutUs from './CommanPages/AboutUs';
import ContactUs from './CommanPages/ContactUs';
import Login from './CommanPages/Login';
import Signup from './CommanPages/Signup';
import Premium from './CommanPages/Premium';

function PublicApp() {
    return (
        <>
            {/* Navbar */}
            <Navbar />

            {/* Public Routes */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/premium" element={<Premium />} />
            </Routes>

            {/* Footer */}
            <Footer />
        </>
    );
}

export default PublicApp;
