import React from 'react';
import '../../../public/css/CommanCss/PremiumCard.css'; // Add custom styles

function PremiumCard({ PlanName, Price, Description }) {
    return (
        <div className="container">
            <div className="premium-card">
                <div className="card-header">
                    <h4 className="plan-name">{PlanName} Plan</h4>
                    <h6 className="plan-price">${Price}/month</h6>
                </div>
                <div className="card-body">
                    <ul className="features-list">
                        {Description.map((feature, index) => (
                            <li key={index} className="feature-item">
                                <i className="fa-solid fa-check feature-icon"></i> {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card-footer">
                    <button className="subscribe-btn">Subscribe Now</button>
                </div>
            </div>
        </div>
    );
}

export default PremiumCard;