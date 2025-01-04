import React from 'react';
import { useLocation } from 'react-router-dom';

function HasBooking() {
    const location = useLocation();
    const { chef } = location.state || {}; // Fallback if no data is provided

    return (
        <div>
            {!chef ? ( // Correct condition for when no chef data is available
                <div>
                    <h1 className='text-center' style={{margin:'50px'}}>Book Chef Now</h1>
                </div>
            ) : (
                <div>
                    <h1>Chef Booking Details</h1>
                    <img src={chef.chefPhotoPath} alt={chef.chefName} />
                    <h2>{chef.chefName}</h2>
                    <p>Specialty: {chef.chefSpecialty}</p>
                    <p>Price: {chef.price}</p>
                </div>
            )}
        </div>
    );
}

export default HasBooking;
