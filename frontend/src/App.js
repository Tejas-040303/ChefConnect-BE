
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerApp from "./CustomerApp";
import PublicApp from "./PublicApp";
import ChefApp from "./ChefApp";
import AdminApp from "./AdminApp";
import { OrderProvider } from "./contexts/OrderContext";
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

function MainApp() {
  return (
    <Router className="">
      <AuthProvider>
        <ChatProvider>
          <OrderProvider>
            <Routes>
              <Route path="/chef/*" element={<ChefApp />} />
              <Route path="/customer/*" element={<CustomerApp />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/*" element={<PublicApp />} />
            </Routes>
          </OrderProvider>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default MainApp;
