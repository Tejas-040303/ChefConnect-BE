import React from 'react';
import { Link } from 'react-router-dom';

function SingleChefCard({ chefId, chefPhotoPath, chefName, chefSpecialty, price }) {
    return (
        <div className="card" style={{ width: '15rem', marginBottom: '20px' }}>
            <img src={chefPhotoPath} className="card-img-top" alt={chefName} />
            <div className="card-body">
                <h5 className="card-title">{chefName}</h5>
                <p className="card-text">{chefSpecialty}</p>
                <Link to={`/customer/payment/${chefId}`} className="btn btn-primary">
                    {price}
                </Link>
            </div>
        </div>
    );
}

export default SingleChefCard;
