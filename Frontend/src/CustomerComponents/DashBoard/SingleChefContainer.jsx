import React, { useState, useEffect } from 'react';
import SingleChefCard from './SingleChefCard';
import axios from 'axios';
import '../../../public/css/CustomerCss/SingleChefContainer.css';

function SingleChefContainer() {
    const [chefData, setChefData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchChefData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/customer/dashboard/chefDetails');
                
                if (response.data && Array.isArray(response.data)) {
                    setChefData(response.data);
                } else {
                    setError("Invalid data format received");
                }
            } catch (error) {
                setError(error.response?.data?.message || "Error fetching chef data");
            } finally {
                setLoading(false);
            }
        };

        fetchChefData();
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading chef profiles...</p>
        </div>
    );

    if (error) return <div className="error-banner">{error}</div>;

    return (
        <div className="chef-grid">
            {chefData.map((chef) => (
                <SingleChefCard 
                    key={chef._id}
                    chefId={chef._id}
                    chefPhotoPath={chef.img}
                    chefName={chef.name}
                    chefSpecialty={chef.specialty}
                    price={chef.price}
                />
            ))}
        </div>
    );
}

export default SingleChefContainer;