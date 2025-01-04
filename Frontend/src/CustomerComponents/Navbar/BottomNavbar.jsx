import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../../public/css/CustomerCss/BottomNavbar.css';

function BottomNavbar() {
    const links = [
        { path: '/customer/', label: 'Home' },
        { path: '/customer/dashboard', label: 'Dashboard' },
        { path: '/customer/booking', label: 'Booking' },
        { path: '/customer/order-history', label: 'History' },
        { path: '/customer/profile', label: 'Profile' },
    ];

    return (
        <div className="bottom-navbar">
            {links.map(({ path, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        isActive ? 'bottom-navbar-item active' : 'bottom-navbar-item'
                    }
                >
                    {label}
                </NavLink>
            ))}
        </div>
    );
}

export default BottomNavbar;
