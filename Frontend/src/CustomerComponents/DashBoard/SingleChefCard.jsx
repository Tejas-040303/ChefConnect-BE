import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../public/css/CustomerCss/SingleChefCard.css';

function SingleChefCard({ chefId, chefPhotoPath, chefName, chefSpecialty, price }) {
    const navigate = useNavigate();

    const handleQuickView = () => {
        navigate(`/customer/chef-profile/${chefId}`);
        console.log(`${chefId}`)
    };

    return (
        <div className="chef-card-wrapper">
            <div className="chef-card">
                <div className="chef-image-container">
                    <img 
                        src={chefPhotoPath} 
                        alt={chefName} 
                        className="chef-profile-image"
                        onError={(e) => {
                            e.target.src = '../../public/person.jpg';
                        }}
                    />
                    <div className="price-badge">₹{price}/meal</div>
                </div>
                
                <div className="chef-info">
                    <h3 className="chef-name">{chefName}</h3>
                    <p className="specialty-tag">
                        {chefSpecialty || 'Multi-Cuisine Expert'}
                    </p>
                    
                    <button 
                        className="cta-button"
                        onClick={handleQuickView}
                    >
                        View Menu Options
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SingleChefCard;