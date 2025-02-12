import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerApp from './CustomerApp';
import PublicApp from './PublicApp';
import ChefApp from './ChefApp';
// import './App.css';

function MainApp() {
    return (
        <Router>
            <Routes>
                {/* Chef Routes */}
                <Route path="/chef/*" element={<ChefApp />} />

                {/* Customer/User Routes */}
                <Route path="/customer/*" element={<CustomerApp />} />

                {/* Public Routes (Fallback) */}
                <Route path="/*" element={<PublicApp />} />
            </Routes>
        </Router>
    );
}

export default MainApp;
