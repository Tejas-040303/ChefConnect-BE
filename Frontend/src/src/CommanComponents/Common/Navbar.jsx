import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid p-2 mx-5">
                <Link className="navbar-brand px-3 mx-3" to="/">ChefConnect</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav ms-auto mx-5 px-3 gap-4 align-items-center">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/about-us">About Us</Link>
                        <Link className="nav-link" to="/premium">Premium</Link>
                        <Link className="nav-link" to="/contact-us">Contact Us</Link>
                        <div className="d-flex">
                            <Link to="/login">
                                <button type="button" className="btn btn-light login">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button type="button" className="btn btn-dark signup">
                                    Signup
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
