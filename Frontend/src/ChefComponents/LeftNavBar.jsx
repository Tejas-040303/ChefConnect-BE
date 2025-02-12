// LeftNavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../public/css/ChefCss/LeftNavBar.css';

function LeftNavBar() {
    const links = [
        { path: '/chef/dashboard', label: 'DashBoard' },
        { path: '/chef/order', label: 'Orders' },
        { path: '/chef/community', label: 'Community' },
        { path: '/chef/profile', label: 'Profile' },
        { path: '/chef/settings', label: 'Settings' },
    ];

    return (
        <div className="left-navbar">
            <h2>Chef Dashboard</h2>
            <ul className="left-navbar-list" style={{ listStyleType: 'none', padding: 0 }}>
                {links.map(({ path, label }) => (
                    <li key={path}>
                        <NavLink
                            to={path}
                            className={({ isActive }) =>
                                isActive ? 'left-navbar-item active' : 'left-navbar-item'
                            }  
                        >
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LeftNavBar;
