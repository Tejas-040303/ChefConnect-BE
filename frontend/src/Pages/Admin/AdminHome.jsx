import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { FaChartBar, FaClipboardList, FaUsersCog, FaTruck } from "react-icons/fa";
import { MdHelp, MdSchool } from "react-icons/md";
import logo from "../../assets/logo.png";
import ExpenseSheet from "../../Components/Admin/ExpenseSheet";
import Queries from "../../Components/Admin/Queries";
import TrackOrder from "../../Components/Admin/TrackOrder";
import TrackUser from "../../Components/Admin/TrackUser";
import ChefTrainingRequest from "../../Components/Admin/ChefTrainingRequest";
import UserConcerns from "../../Components/Admin/UserConcerns";

function AdminHome() {
  // Define quick access cards for the dashboard
  const dashboardCards = [
    { 
      title: "Expense Management", 
      icon: FaChartBar, 
      path: "/admin/expense-sheet", 
      description: "Track financial records and manage expenses" 
    },
    { 
      title: "User Queries", 
      icon: MdHelp, 
      path: "/admin/queries", 
      description: "Manage and respond to user inquiries" 
    },
    { 
      title: "Order Tracking", 
      icon: FaTruck, 
      path: "/admin/track-order", 
      description: "Monitor order status and deliveries" 
    },
    { 
      title: "User Management", 
      icon: FaUsersCog, 
      path: "/admin/track-user", 
      description: "View and manage user accounts" 
    },
    { 
      title: "Chef Training", 
      icon: MdSchool, 
      path: "/admin/chef-training", 
      description: "Review and approve chef training requests" 
    },
    { 
      title: "Customer Support", 
      icon: FaClipboardList, 
      path: "/admin/user-concerns", 
      description: "Address user concerns and feedback" 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center">
              <img src={logo} alt="Logo" className="h-12 mr-2" />
              <span className="font-bold text-xl text-gray-800 py-4 px-2">Admin</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex">
            <Link to="/admin/track-user" className="py-4 px-4 hover:text-blue-600 transition-colors">Track User</Link>
            <Link to="/admin/track-order" className="py-4 px-4 hover:text-blue-600 transition-colors">Track Order</Link>
            <Link to="/admin/expense-sheet" className="py-4 px-4 hover:text-blue-600 transition-colors">Expense Sheet</Link>
            <Link to="/admin/chef-training" className="py-4 px-4 hover:text-blue-600 transition-colors">Chef Training</Link>
            <Link to="/admin/queries" className="py-4 px-4 hover:text-blue-600 transition-colors">Queries</Link>
            <Link to="/admin/user-concerns" className="py-4 px-4 hover:text-blue-600 transition-colors">Complaints</Link>
          </div>
          
          {/* Logout Button */}
          <Link to="/logout" className="py-4 px-6 text-red-600 font-medium hover:text-red-800 transition-colors">Logout</Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={
              <div>
                {/* Logo with animation */}
                <div className="flex justify-center mb-8">
                  <img 
                    src={logo} 
                    alt="Dashboard Logo" 
                    className="h-32"
                    style={{
                      animation: "float 3s ease-in-out infinite"
                    }}
                  />
                </div>
                
                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-32">
                  {dashboardCards.map((card, index) => (
                    <Link 
                      to={card.path} 
                      key={index} 
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-50 p-3 rounded-full">
                          <card.icon className="text-blue-600 text-xl" />
                        </div>
                        <h2 className="text-xl font-semibold ml-4">{card.title}</h2>
                      </div>
                      <p className="text-gray-600">{card.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            } />
            <Route path="/expense-sheet" element={<ExpenseSheet />} />
            <Route path="/queries" element={<Queries />} />
            <Route path="/track-order" element={<TrackOrder />} /> {/*done*/}
            <Route path="/track-user" element={<TrackUser />} /> {/*done*/}
            <Route path="/chef-training" element={<ChefTrainingRequest />} />
            <Route path="/user-concerns" element={<UserConcerns />} />
          </Routes>
        </div>
      </div>
      
      {/* CSS for logo animation */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminHome;