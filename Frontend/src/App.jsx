import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerApp from './CustomerApp';
import PublicApp from './PublicApp';

function MainApp() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/*" element={<PublicApp />} />

                {/* Customer/User Routes */}
                <Route path="/customer/*" element={<CustomerApp />} />
            </Routes>
        </Router>
    );
}

export default MainApp;
