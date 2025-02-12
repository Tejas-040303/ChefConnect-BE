import React, { useState } from 'react';
// import './SearchBar.css';
import '../../../public/css/CustomerCss/SearchBar.css';


function SearchBar({ setCurrentView }) {
    const [activeButton, setActiveButton] = useState('singleChef');

    const handleButtonClick = (view) => {
        setActiveButton(view);
        setCurrentView(view);
    };

    return (
        <div className="search-container">
            {/* Chef Selection Buttons */}
            <div className="chef-buttons">
                <button
                    className={`chef-button ${activeButton === 'singleChef' ? 'chef-button-active' : ''}`}
                    type="button"
                    onClick={() => handleButtonClick('singleChef')}
                >
                    Single Chef
                </button>
                <button
                    className={`chef-button ${activeButton === 'chefCollaboration' ? 'chef-button-active' : ''}`}
                    type="button"
                    onClick={() => handleButtonClick('chefCollaboration')}
                >
                    Chef Collaboration
                </button>
            </div>

            {/* Search Input & Button */}
            <div className="search-box">
                <input
                    className="search-input"
                    type="search"
                    placeholder="Search for chefs or cuisines..."
                    aria-label="Search"
                />
                <button className="search-button" type="submit">
                    Search
                </button>
            </div>
        </div>
    );
}

export default SearchBar;
