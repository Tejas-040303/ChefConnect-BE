import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../public/css/CustomerCss/ChefPreview.css';

function ChefPreview() {
    const { id } = useParams();
    const [chef, setChef] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChefDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/customer/chef/${id}`);
                setChef(response.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Error loading chef details');
            } finally {
                setLoading(false);
            }
        };

        fetchChefDetails();
    }, [id]);

    if (loading) return <div className="chef-profile-loading">Loading chef details...</div>;
    if (error) return <div className="chef-profile-error">{error}</div>;

    // Helper function to capitalize words
    const capitalize = (str) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const bookThisChef = () => {
        // Implement booking logic here
        navigate(`/customer/booking/${id}`);
        alert(`Processed for Booking ${chef?.name}`);
    }

    return (
        <div className="chef-profile-container">
            {/* Header Section */}
            <div className="chef-header">
                <img
                    src={chef?.img}
                    alt={chef?.name}
                    className="chef-main-image"
                    onError={(e) => {
                        e.target.src = '/default-chef.jpg';
                    }}
                />
                <div className="chef-basic-info">
                    <h1>{chef?.name}</h1>
                    <p className="specialty">{chef?.specialty || 'Multi-Cuisine Expert'}</p>
                    <div className="metadata">
                        <p><span>📍 Location:</span> {chef?.location || 'Not specified'}</p>
                        <p><span>📞 Phone:</span> {chef?.phone || 'Not provided'}</p>
                    </div>
                </div>
            </div>

            {/* Dishes Section */}
            <div className="section">
                <h2>Menu Offerings</h2>
                <div className="dishes-tables">
                    {chef?.dishes && (
                        <>
                            {chef.dishes.rotis?.length > 0 && (
                                <div className="dish-category">
                                    <h3>Rotis & Breads</h3>
                                    <table>
                                        <tbody>
                                            {chef.dishes.rotis.map((dish, index) => (
                                                <tr key={`roti-${index}`}>
                                                    <td>{capitalize(dish)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {chef.dishes.rice?.length > 0 && (
                                <div className="dish-category">
                                    <h3>Rice Dishes</h3>
                                    <table>
                                        <tbody>
                                            {chef.dishes.rice.map((dish, index) => (
                                                <tr key={`rice-${index}`}>
                                                    <td>{capitalize(dish)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {chef.dishes.fastFoods?.length > 0 && (
                                <div className="dish-category">
                                    <h3>Fast Foods</h3>
                                    <table>
                                        <tbody>
                                            {chef.dishes.fastFoods.map((dish, index) => (
                                                <tr key={`fastfood-${index}`}>
                                                    <td>{capitalize(dish)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Schedule Section */}
            <div className="section">
                <h2>Weekly Schedule</h2>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Availability</th>
                            <th>Time Slots</th>
                            <th>Max Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chef?.schedule?.map((day) => (
                            <tr
                                key={day.day}
                                className={day.available ? 'available' : 'unavailable'}
                            >
                                <td>{day.day}</td>
                                <td>{day.available ? 'Available' : 'Not Available'}</td>
                                <td>
                                    {day.available ? (
                                        day.slots.map((slot, index) => (
                                            <div key={`slot-${index}`}>
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                        ))
                                    ) : 'N/A'}
                                </td>
                                <td>
                                    {day.available ? (
                                        day.slots.map((slot, index) => (
                                            <div key={`max-${index}`}>
                                                {slot.maxOrders}
                                            </div>
                                        ))
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* About Section */}
            {chef?.bio && (
                <div className="section">
                    <h2>About the Chef</h2>
                    <p className="bio">{chef.bio}</p>
                </div>
            )}

            <div className="btn btn-primary" onClick={bookThisChef}>
                Processed for Booking
            </div>
        </div>
    );
}

export default ChefPreview;