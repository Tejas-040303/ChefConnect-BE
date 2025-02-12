import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ setCurrentView }) {
    const [activeButton, setActiveButton] = useState('singleChef'); // Set initial active button

    const handleButtonClick = (view) => {
        setActiveButton(view); // Update the active button
        setCurrentView(view); // Trigger the view change
    };

    return (
        <div className="search-bar-container">
            <nav className="navbar navbar-expand-lg w-100">
                <div className="navbar-collapse" id="navbarSupportedContent">
                    <form className="form-inline search-form">
                        {/* Chef Team Buttons */}
                        <div className="btn-group chef-team">
                            <button
                                className={`btn btn-outline-primary ${activeButton === 'singleChef' ? 'active' : ''}`}
                                type="button"
                                onClick={() => handleButtonClick('singleChef')}
                            >
                                Single Chef
                            </button>
                            <button
                                className={`btn btn-outline-primary ${activeButton === 'chefCollaboration' ? 'active' : ''}`}
                                type="button"
                                onClick={() => handleButtonClick('chefCollaboration')}
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