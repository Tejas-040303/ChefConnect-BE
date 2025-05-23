import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  MdHome, 
  MdSpaceDashboard, 
  MdRestaurantMenu, 
  MdReceiptLong, 
  MdGroups,
  MdSchool,
  MdAccountCircle, 
  MdTune, 
  MdExitToApp 
} from "react-icons/md";

function LeftNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Toggle sidebar between collapsed and expanded
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    navigate('/'); // Redirect to login page
  };

  const navItems = [
    { path: "/chef/", icon: MdHome, label: "Home" },
    { path: "/chef/dashboard", icon: MdSpaceDashboard, label: "Dashboard" },
    { path: "/chef/order", icon: MdRestaurantMenu, label: "Order" },
    { path: "/chef/history", icon: MdReceiptLong, label: "History" },
    { path: "/chef/chat", icon: MdGroups, label: "Community" },
    { path: "/chef/training", icon: MdSchool, label: "Training" },
    { path: "/chef/profile", icon: MdAccountCircle, label: "Profile" },
    { path: "/chef/setting", icon: MdTune, label: "Settings" },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen bg-amber-400 relative transition-all duration-300 flex flex-col border-r-4 border-white`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="absolute top-2 right-2 text-white bg-amber-500 p-1 rounded"
      >
        {isCollapsed ? ">" : "<"}
      </button>

      <nav className="p-5 flex-1 mt-6 ">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-white hover:text-red-500 text-lg flex items-center hover:bg-amber-700 py-2 px-3 rounded hover:scale-105 transition-all duration-200"
                    : "text-white text-lg flex items-center py-2 px-3 rounded hover:text-red-500 hover:bg-amber-700 hover:scale-105 transition-all duration-200"
                }
              >
                {isCollapsed ? (
                  <item.icon className={isCollapsed ? "text-3xl" : "text-2xl"} />
                ) : (
                  <>
                    <item.icon className="text-2xl mr-4" />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button at Bottom Left */}
      <div className="p-5 mt-2">
        <button
          onClick={handleLogout}
          className="text-white text-lg flex items-center py-2 px-3 rounded hover:text-red-800 hover:bg-amber-700 hover:scale-105 transition-all duration-200 w-full"
        >
          {isCollapsed ? (
            <MdExitToApp className={isCollapsed ? "text-3xl" : "text-2xl"} />
          ) : (
            <>
              <MdExitToApp className="text-2xl mr-4" />
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default LeftNavBar;