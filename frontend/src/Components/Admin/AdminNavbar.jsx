import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Navigation items
    const navItems = [
        { to: "/admin/track-user", label: "Track User" },
        { to: "/admin/track-order", label: "Track Order" },
        { to: "/admin/expense-sheet", label: "Expense Sheet" },
        { to: "/admin/chef-training", label: "Chef Training" },
        { to: "/admin/queries", label: "Queries" },
        { to: "/admin/user-concerns", label: "Complaints & Requests" },
    ];

    const handleLogout = () => {
        // Clear admin token and redirect
        localStorage.removeItem("adminToken");
        navigate("/");
    };

    return (
        <nav className="bg-gray-50 shadow w-full">
            <div className="container mx-auto px-12 py-5">
                <div className="flex justify-between items-center">
                    <NavLink
                        to="/admin"
                        className="text-lg font-bold text-gray-800"
                    >
                        Admin
                    </NavLink>

                    <div className="hidden lg:flex items-center gap-4">
                        <ul className="flex space-x-4">
                            {navItems.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "px-3 py-2 font-bold text-gray-900 border border-black rounded"
                                                : "px-3 py-2 text-gray-700 hover:text-gray-900"
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        
                        {/* Logout Button - Desktop */}
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden text-gray-600 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className="block w-6 h-0.5 bg-gray-600"></span>
                        <span className="block w-6 h-0.5 bg-gray-600 mt-1"></span>
                        <span className="block w-6 h-0.5 bg-gray-600 mt-1"></span>
                    </button>
                </div>

                {/* Mobile menu */}
                <div className={`${isOpen ? "block" : "hidden"} lg:hidden`}>
                    <ul className="flex flex-col space-y-2 pb-4">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "block px-3 py-2 font-bold text-gray-900 border border-black rounded"
                                            : "block px-3 py-2 text-gray-700 hover:text-gray-900"
                                    }
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                        
                        {/* Logout Button - Mobile */}
                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default AdminNavbar;