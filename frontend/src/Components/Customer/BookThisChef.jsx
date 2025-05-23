import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";

const BookThisChef = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "Your Name",
    deliveryAddress: "Your Address",
    selectedDishes: [],
    numberOfPeople: 1,
    selectedDate: new Date().toISOString().split("T")[0],
    selectedTimeSlot: null,
    duration: 2,
    diet: "None",
    allergies: "",
    total: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const hourlyRate = 30;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in. Please log in to book a chef.");
        setLoading(false);
        return;
      }
      try {
        const customerResponse = await axios.get(
          "http://localhost:8080/customer/customerprofile/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const chefResponse = await axios.get(
          `http://localhost:8080/customer/chefdetails/${id}`
        );
        setChef(chefResponse.data);
        setFormData((prev) => ({
          ...prev,
          customerName: customerResponse.data.name || "",
          deliveryAddress: customerResponse.data.address || "",
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
    
    // Set up interval to update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    const calculateTotal = () => {
      if (!chef) return;
      const dishTotal = formData.selectedDishes.reduce((sum, dishId) => {
        const dish = chef.dishes.find((d) => d._id === dishId);
        return sum + (dish ? dish.price : 0);
      }, 0);
      const serviceCost = formData.numberOfPeople * formData.duration * hourlyRate;
      setFormData((prev) => ({
        ...prev,
        total: dishTotal + serviceCost,
      }));
    };
    calculateTotal();
  }, [formData.numberOfPeople, formData.duration, formData.selectedDishes, chef]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedTimeSlot: null,
    }));
  }, [formData.selectedDate]);

  const handleDishSelection = (dishId) => {
    setFormData((prev) => ({
      ...prev,
      selectedDishes: prev.selectedDishes.includes(dishId)
        ? prev.selectedDishes.filter((id) => id !== dishId)
        : [...prev.selectedDishes, dishId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeSlotSelection = (slot, day) => {
    setFormData((prev) => ({
      ...prev,
      selectedTimeSlot: {
        day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    }));
  };

  const isDateValid = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };
  
  // Check if a time slot is in the past (for today only)
  const isTimeSlotPassed = (slot) => {
    // Only apply this check for today's date
    if (formData.selectedDate !== new Date().toISOString().split("T")[0]) {
      return false;
    }
    
    // Parse slot time
    const [startHour, startMinutes] = slot.startTime
      .replace(/[APM]/g, '')
      .trim()
      .split(':')
      .map(part => parseInt(part, 10));
      
    let hours = startHour;
    
    // Convert to 24-hour format
    if (slot.startTime.includes('PM') && hours < 12) {
      hours += 12;
    } else if (slot.startTime.includes('AM') && hours === 12) {
      hours = 0;
    }
    
    // Create date object for the slot start time
    const slotTime = new Date();
    slotTime.setHours(hours, startMinutes || 0, 0, 0);
    
    // Return true if slot time is in the past
    return slotTime < currentTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (
      !formData.customerName ||
      !formData.deliveryAddress ||
      formData.selectedDishes.length === 0 ||
      !formData.selectedDate ||
      !formData.selectedTimeSlot
    ) {
      alert("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }
    if (!isDateValid(formData.selectedDate)) {
      alert("Please select a valid date (today or later).");
      setIsSubmitting(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Please log in to book a chef.");
      setIsSubmitting(false);
      return;
    }
    const orderData = {
      chefId: id,
      dishes: formData.selectedDishes.map((dishId) => ({
        dish: dishId,
        quantity: 1,
      })),
      numberOfPeople: parseInt(formData.numberOfPeople),
      selectedDate: new Date(formData.selectedDate).toISOString(),
      selectedTimeSlot: formData.selectedTimeSlot,
      deliveryAddress: formData.deliveryAddress,
      diet: formData.diet,
      allergies: formData.allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      total: formData.total,
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/customer/cheforder",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/customer/booking-confirmation/${response.data._id}`);
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data || error.message
      );
      alert(
        "Failed to create order: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="text-center p-8 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-600 border-opacity-50 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-amber-800">
            Loading chef details...
          </h2>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (!chef)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-amber-500 text-5xl mb-4">❓</div>
          <h2 className="text-xl font-medium text-gray-800">Chef not found</h2>
        </div>
      </div>
    );

  const selectedDay = formData.selectedDate
    ? new Date(formData.selectedDate).toLocaleString("en-us", {
        weekday: "long",
      })
    : null;
  const availableSlots = chef.schedule
    ? chef.schedule
        .filter((sched) => sched.isWorking && sched.day === selectedDay)
        .flatMap((sched) => sched.slots)
    : [];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-4xl mx-auto">
        {}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center bg-white rounded-lg shadow-lg px-4 py-2 text-amber-700 hover:text-amber-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        <div className="bg-white/50 rounded-2xl shadow-xl overflow-hidden">
          {}
          <div className="bg-amber-600 px-6 py-8 text-white">
            <h2 className="text-3xl font-bold text-center">
              Book Chef {chef.name}
            </h2>
            <p className="text-center mt-2 text-amber-100">
              Complete your booking details below
            </p>
          </div>
          {}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {}
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName || ""}
                      onChange={handleChange}
                      required
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress || ""}
                      onChange={handleChange}
                      required
                      placeholder="Your Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              {}
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                  </svg>
                  Select Dishes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chef.dishes.map((dish) => (
                    <div
                      key={dish._id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        formData.selectedDishes.includes(dish._id)
                          ? "border-amber-500 bg-amber-50 shadow-md"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedDishes.includes(dish._id)}
                          onChange={() => handleDishSelection(dish._id)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="block font-medium text-gray-900">
                            {dish.name}
                          </span>
                          <span className="block text-amber-600 font-medium mt-1">
                            <FaRupeeSign className="inline text-xs mb-1" />
                            {dish.price}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {}
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Booking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of People
                    </label>
                    <input
                      type="number"
                      name="numberOfPeople"
                      min="1"
                      value={formData.numberOfPeople}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="selectedDate"
                      value={formData.selectedDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    {!isDateValid(formData.selectedDate) && (
                      <p className="text-red-500 text-sm mt-1">
                        Please select a valid date (today or later).
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours)
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diet
                    </label>
                    <select
                      name="diet"
                      value={formData.diet}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="None">None</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g., nuts, dairy"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              {}
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Available Time Slots
                </h3>
                {formData.selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot, index) => {
                        const slotPassed = isTimeSlotPassed(slot);
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 text-center ${
                              slotPassed 
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                                : "cursor-pointer transition-all duration-200"
                            } ${
                              !slotPassed &&
                              formData.selectedTimeSlot &&
                              formData.selectedTimeSlot.day === selectedDay &&
                              formData.selectedTimeSlot.startTime === slot.startTime &&
                              formData.selectedTimeSlot.endTime === slot.endTime
                                ? "border-amber-500 bg-amber-100 shadow-md"
                                : !slotPassed
                                ? "border-gray-200 hover:border-amber-300"
                                : ""
                            }`}
                            onClick={() => {
                              if (!slotPassed) {
                                handleTimeSlotSelection(slot, selectedDay);
                              }
                            }}
                          >
                            <label className={slotPassed ? "cursor-not-allowed" : "cursor-pointer"}>
                              <input
                                type="radio"
                                name="timeSlot"
                                checked={
                                  formData.selectedTimeSlot &&
                                  formData.selectedTimeSlot.day === selectedDay &&
                                  formData.selectedTimeSlot.startTime === slot.startTime &&
                                  formData.selectedTimeSlot.endTime === slot.endTime
                                }
                                onChange={() => {}}
                                disabled={slotPassed}
                                className="sr-only"
                              />
                              <span className={`block font-medium ${slotPassed ? "text-gray-500" : "text-gray-800"}`}>
                                {slot.startTime}-{slot.endTime}
                              </span>
                              <span className={`block text-sm ${slotPassed ? "text-gray-400" : "text-gray-500"} mt-1`}>
                                Max Orders: {slot.maxOrders}
                              </span>
                              {slotPassed && (
                                <span className="block text-xs text-gray-500 mt-1 italic">
                                  Time slot passed
                                </span>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-600 font-medium">
                        No available slots for {selectedDay}.
                      </p>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selectedDate: "",
                          }))
                        }
                        className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      >
                        Select a different date
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    Please select a date to see available slots.
                  </p>
                )}
              </div>
              {}
              <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Booking Summary
                  </h3>
                  <div className="text-2xl font-bold text-amber-600">
                    <FaRupeeSign className="inline text-lg mb-1" />
                    {formData.total}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !isDateValid(formData.selectedDate) || 
                    !formData.selectedTimeSlot
                  }
                  className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookThisChef;