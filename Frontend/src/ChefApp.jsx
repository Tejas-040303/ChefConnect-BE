// ChefApp.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChefHome from './ChefPages/ChefHome';

function ChefApp() {
    return (
        <div className="">
            <Routes>
                <Route path="/*" element={<ChefHome />} />
            </Routes>
        </div>
    );
}

export default ChefApp;
