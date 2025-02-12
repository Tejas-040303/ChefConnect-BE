import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../public/css/CustomerCss/ChefBooking.css';
const ChefBooking = () => {
    const { chefId } = useParams();
    const navigate = useNavigate();
    const [chef, setChef] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedHours, setSelectedHours] = useState(2);
    const [totalBill, setTotalBill] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock hourly rate (you should add this to your ChefSchema later)
    const hourlyRate = 30;

    useEffect(() => {
        const fetchChefDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/customer/chef/${chefId}`);
                setChef(response.data);
                setSelectedDay(response.data.schedule?.find(day => day.available)?.day || '');
            } catch (error) {
                console.error('Error fetching chef details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChefDetails();
    }, [chefId]);

    useEffect(() => {
        calculateTotal();
    }, [numberOfPeople, selectedHours, selectedDishes]);

    const calculateTotal = () => {
        // Simple calculation - modify based on your actual pricing model
        const basePrice = selectedDishes.length * 10; // $10 per dish
        const serviceCost = numberOfPeople * selectedHours * hourlyRate;
        setTotalBill(basePrice + serviceCost);
    };

    const handleDishSelection = (dish) => {
        setSelectedDishes(prev =>
            prev.includes(dish)
                ? prev.filter(d => d !== dish)
                : [...prev, dish]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const orderData = {
          chefId,
          dishes: selectedDishes.map(dish => ({ name: dish, price: 10 })),
          numberOfPeople,
          selectedDay,
          selectedHours,
          totalBill
        };
      
        try {
          const response = await axios.post('http://localhost:8080/orders', orderData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          navigate(`/customer/booking-confirmation/${response.data._id}`);
        } catch (error) {
          console.error('Error creating order:', error);
          alert('Failed to create order');
        }
      };

    if (loading) return <div>Loading chef details...</div>;

    return (
        <div className="booking-container">
            <h2>Book Chef {chef?.name}</h2>

            <form onSubmit={handleSubmit}>
                {/* Dish Selection */}
                <div className="section">
                    <h3>Select Dishes</h3>
                    {chef.dishes && (
                        <>
                            {Object.entries(chef.dishes).map(([category, dishes]) => (
                                dishes.length > 0 && (
                                    <div key={category} className="dish-category">
                                        <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                                        <div className="dish-options">
                                            {dishes.map((dish, index) => (
                                                <label key={`${category}-${index}`}>
                                                    <input
                                                        type="checkbox"
                                                        value={dish}
                                                        checked={selectedDishes.includes(dish)}
                                                        onChange={() => handleDishSelection(dish)}
                                                    />
                                                    {dish}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </>
                    )}
                </div>

                {/* Number of People */}
                <div className="form-group">
                    <label>
                        Number of People:
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(Math.max(1, e.target.value))}
                        />
                    </label>
                </div>

                {/* Schedule Selection */}
                <div className="form-group">
                    <label>
                        Select Day:
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            required
                        >
                            <option value="">Select a day</option>
                            {chef.schedule?.filter(day => day.available).map(day => (
                                <option key={day.day} value={day.day}>
                                    {day.day}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Hours Selection */}
                <div className="form-group">
                    <label>
                        Number of Hours:
                        <select
                            value={selectedHours}
                            onChange={(e) => setSelectedHours(parseInt(e.target.value))}
                        >
                            {[2, 3, 4, 5, 6].map(hours => (
                                <option key={hours} value={hours}>
                                    {hours} hours
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Bill Summary */}
                <div className="bill-summary">
                    <h3>Total Estimate: ${totalBill}</h3>
                    <p>Breakdown:</p>
                    <ul>
                        <li>Dishes: ${selectedDishes.length * 10}</li>
                        <li>Service ({numberOfPeople} people × {selectedHours} hrs × ${hourlyRate}/hr):
                            ${numberOfPeople * selectedHours * hourlyRate}
                        </li>
                    </ul>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
            </form>
        </div>
    );
};

export default ChefBooking;