
import React from 'react';
import { Link } from 'react-router-dom';
import '../../../public/css/CommanCss/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-gradient"></div>
            <div className="footer-content">
                <div className="footer-logo">
                    <img src="logo.png" alt="LOGO" className="footer-logo-image" />
                    <p className="footer-tagline">Your trusted partner for all things tech.</p>
                </div>
                <div className="footer-links">
                    <h5 className="footer-heading">Quick Links</h5>
                    <ul className="footer-list">
                        <li className="footer-list-item"><Link to="/">Home</Link></li>
                        <li className="footer-list-item"><Link to="/about-us">About Us</Link></li>
                        <li className="footer-list-item"><Link to="/premium">Premium</Link></li>
                        <li className="footer-list-item"><Link to="/contact-us">Contact Us</Link></li>
                    </ul>
                </div>
                <div className="footer-social">
                    <h5 className="footer-heading">Follow Us</h5>
                    <div className="footer-social-icons">
                        <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-facebook"></i>
                        </a>
                        <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-x-twitter"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Your Company. All Rights Reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;