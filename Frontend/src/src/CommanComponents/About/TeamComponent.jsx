import React from 'react';

function TeamComponent({pngPath, Name, Designation }) {
    return (
        <div className="team-component">
            <img src={pngPath} alt="person image" />
            <h3>{Name}</h3>
            <h5>{Designation}</h5>
        </div>
    );
}

export default TeamComponent;