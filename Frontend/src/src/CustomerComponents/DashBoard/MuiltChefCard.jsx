import React from 'react';

function MuiltChefCard({chefPhotoPath, chefName, chefSpecialty, price}) {
    return (
        <div className="container">
            <h2>Muilt Chef Container</h2>
            <div className="card" style="width: 18rem;">
                <img src={chefPhotoPath} className="card-img-top" alt="..." />
                <div className="card-body">
                    <h5 className="card-title">{chefName}</h5>
                    <p className="card-text">{chefSpecialty}</p>
                    <button className="btn btn-primary">{price}</button>
                </div>
            </div>
        </div>
    );
}

export default MuiltChefCard;