import React from 'react';

function ServicesCard({ svgPath, ServicesName }) {
    return (
        <div className="container">
            <div className="card service-card" style={{ width: "18rem", border:"none" }}>
                {/* Use SVG directly */}
                <div className="card-img-top text-center my-3">
                    <img src={svgPath} alt={`${ServicesName} icon`} style={{ width: "200px", height: "200px" }} />
                </div>
                <div className="card-body">
                    <h4 className="card-title text-center">{ServicesName}</h4>
                </div>
            </div>
        </div>
    );
}

export default ServicesCard;
