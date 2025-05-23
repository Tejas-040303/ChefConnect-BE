import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  MdHome,
  MdSpaceDashboard,
  MdCalendarMonth,
  MdReceiptLong,
  MdGroups,
  MdAccountCircle,
  MdTune,
  MdExitToApp
} from "react-icons/md";

function BottomNavBar() {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { path: "/customer/", icon: MdHome, label: "Home" },
    { path: "/customer/dashboard", icon: MdSpaceDashboard, label: "Dashboard" },
    { path: "/customer/bookings", icon: MdCalendarMonth, label: "Booking" },
    { path: "/customer/order-history", icon: MdReceiptLong, label: "History" },
    { path: "/customer/chat", icon: MdGroups, label: "Community" },
    { path: "/customer/profile", icon: MdAccountCircle, label: "Profile" },
    { path: "/customer/settings", icon: MdTune, label: "Settings" },
    { path: "/", icon: MdExitToApp, label: "Logout", onClick: handleLogout },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg z-50 border-t border-amber-300">
      <div className="flex w-full">
        {navItems.map(({ path, icon: Icon, label, onClick }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClick || undefined}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 ${
                isActive
                  ? "bg-amber-400 text-amber-800 hover:bg-amber-500  hover:text-white"
                  : "text-amber-800 hover:bg-amber-500 hover:text-white"
              } transition-all duration-200`
            }
          >
            <Icon className="text-xl mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default BottomNavBar;