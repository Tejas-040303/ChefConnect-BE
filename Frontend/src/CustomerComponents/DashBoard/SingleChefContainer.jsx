import React from 'react';
import SingleChefCard from './SingleChefCard';
import chefData from '../../data/SingleChefData'; // Ensure the path is correct
import '../../../public/css/CustomerCss/SingleChefContainer.css';

function SingleChefContainer() {
    return (
        <div className="single-chef-container">
            {chefData.map((chef, index) => (
                <SingleChefCard
                    key={index}
                    chefId={chef.id}
                    chefPhotoPath={chef.chefPhotoPath}
                    chefName={chef.chefName}
                    chefSpecialty={chef.chefSpecialty}
                    price={chef.price}
                />
            ))}
        </div>
    );
}

export default SingleChefContainer;
