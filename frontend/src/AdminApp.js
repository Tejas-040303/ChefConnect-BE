// ChefApp.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHome from "./Pages/Admin/AdminHome";

function AdminApp() {
  return (
    <div className="">
      <Routes>
        <Route path="/*" element={<AdminHome/>} />
      </Routes>
    </div>
  );
}

export default AdminApp;
