// ChefApp.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ChefHome from './Pages/Chef/ChefHome';
import ChefProfile from './Pages/Chef/ChefProfile';

function ChefApp() {
  return (
    <div className="">
      <Routes>
        <Route path="/*" element={<ChefHome/>} />
        <Route path="/chef-profile" element={<ChefProfile/>} />
      </Routes>
    </div>
  );
}

export default ChefApp;
