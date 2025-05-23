import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Comman/Home";
import About from "./Pages/Comman/About";
import Premium from "./Pages/Comman/Premium";
import Contact from "./Pages/Comman/Contact";
import Signup from "./Pages/Comman/Signup";
import Login from "./Pages/Comman/Login";
import ForgotPassword from "./Pages/Comman/ForgotPassword";
import PasswordReset from "./Pages/Comman/PasswordReset";
import AdminSignup from "./Pages/Comman/AdminSignup";
import AdminLogin from "./Pages/Comman/AdminLogin";
import Navbar from "../src/Components/Comman/NavBar/Navbar";
import Footer from "./Components/Comman/Footer/Footer";
const PublicApp = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About/>}/>
        <Route path="/premium" element={<Premium />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<PasswordReset />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
      <Footer/>
    </>
  );
};

export default PublicApp;
