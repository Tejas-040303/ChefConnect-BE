import React, { useState } from 'react';
import SidePanel from '../CustomerComponents/DashBoard/SidePanel';
import SearchBar from '../CustomerComponents/DashBoard/SearchBar';
import SingleChefContainer from '../CustomerComponents/DashBoard/SingleChefContainer';
import MuiltChefContainer from '../CustomerComponents/DashBoard/MuiltChefContainer';
import '../../public/css/CustomerCss/DashBoard.css';

function DashBoard() {
    // State to track what to render in the main content
    const [currentView, setCurrentView] = useState('default');

    return (
        <div className="grid-container">
            <div className="item1">
                <SidePanel />
            </div>
            <div className="item2">
                {/* Pass setCurrentView to SearchBar for updating the view */}
                <SearchBar setCurrentView={setCurrentView} />
            </div>
            <div className="item3">
                {/* Conditionally render components based on currentView */}
                {currentView === 'singleChef' && <SingleChefContainer />}
                {currentView === 'chefCollaboration' && <MuiltChefContainer />}
                {currentView === 'default' && <SingleChefContainer/>}
            </div>
        </div>
    );
}

export default DashBoard;
