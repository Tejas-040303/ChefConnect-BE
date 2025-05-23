import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerProfile from "./Components/Customer/CustomerProfile";
import CustomerHome from "./Pages/Customer/CustomerHome";

function CustomerApp() {
  return (
    <>
      <Routes>
        <Route path="/*" element={<CustomerHome />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
      </Routes>
    </>
  );
}

export default CustomerApp;
