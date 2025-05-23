import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png'; // Adjust the path as necessary
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-2 shadow-lg sticky top-0 z-50 backdrop-blur-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-white text-3xl font-extrabold tracking-tight hover:text-yellow-200 transition-colors duration-300"
                >
                    <img src={logo} alt="Logo" className="h-20 w-20 inline-block mr-2" />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex space-x-8">
                    <Link
                        to="/"
                        className="text-white text-lg font-medium hover:text-yellow-200 hover:scale-105 transform transition-all duration-300"
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className="text-white text-lg font-medium hover:text-yellow-200 hover:scale-105 transform transition-all duration-300"
                    >
                        About
                    </Link>
                    <Link
                        to="/premium"
                        className="text-white text-lg font-medium hover:text-yellow-200 hover:scale-105 transform transition-all duration-300"
                    >
                        Premium
                    </Link>
                    <Link
                        to="/contact"
                        className="text-white text-lg font-medium hover:text-yellow-200 hover:scale-105 transform transition-all duration-300"
                    >
                        Contact
                    </Link>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex space-x-4">
                    <Link to="/login">
                        <button
                            className="bg-white text-orange-600 px-5 py-2 rounded-full font-semibold shadow-md border-2 border-orange-600 hover:bg-orange-100 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Login
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button
                            className="bg-orange-600 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:bg-orange-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Signup
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="md:hidden mt-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-opacity-90 rounded-lg p-4 animate-slide-down">
                    <Link
                        to="/"
                        className="block text-white text-lg font-medium py-2 hover:text-yellow-200 transition-colors duration-300"
                        onClick={toggleMenu}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className="block text-white text-lg font-medium py-2 hover:text-yellow-200 transition-colors duration-300"
                        onClick={toggleMenu}
                    >
                        About
                    </Link>
                    <Link
                        to="/premium"
                        className="block text-white text-lg font-medium py-2 hover:text-yellow-200 transition-colors duration-300"
                        onClick={toggleMenu}
                    >
                        Premium
                    </Link>
                    <Link
                        to="/contact"
                        className="block text-white text-lg font-medium py-2 hover:text-yellow-200 transition-colors duration-300"
                        onClick={toggleMenu}
                    >
                        Contact
                    </Link>
                    <div className="flex flex-col space-y-3 mt-4">
                        <Link to="/login" onClick={toggleMenu}>
                            <button
                                className="w-full bg-white text-orange-600 px-4 py-2 rounded-full font-semibold shadow-md hover:bg-orange-100 transition-all duration-300"
                            >
                                Login
                            </button>
                        </Link>
                        <Link to="/signup" onClick={toggleMenu}>
                            <button
                                className="w-full bg-orange-700 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:bg-orange-800 transition-all duration-300 "
                            >
                                Signup
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

// Custom Animation for Mobile Menu
const styles = `
  @keyframes slide-down {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`;

// Inject styles into document head (you can move this to a CSS file if preferred)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Navbar;