import React from 'react';
import { Link } from 'react-router-dom';
import '../../../public/css/CustomerCss/SearchBar.css';

function SearchBar({ setCurrentView }) {
    return (
        <div className="search-bar-container">
            <nav className="navbar navbar-expand-lg">
                <div className="navbar-collapse" id="navbarSupportedContent">
                    <form className="form-inline search-form">
                        {/* Chef Team Buttons */}
                        <div className="btn-group chef-team">
                            <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => setCurrentView('singleChef')}
                            >
                                Single Chef
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => setCurrentView('chefCollaboration')}
                            >
                                Chef Collaboration
                            </button>
                        </div>

                        {/* Search Input and Button */}
                        <div className="btn-group search-group">
                            <input
                                className="form-control search-input"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                            />
                            <button
                                className="btn btn-outline-success search-button"
                                type="submit"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </nav>
            <div className="line"></div>
        </div>
    );
}

export default SearchBar;
