import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";

// Define sub-categories for each dish category
const subCategories = {
  Veges: ["Paneer", "Aloo", "Gobi", "Bhindi", "Palak", "Mushroom", "Kofta", "Chole"],
  Rotis: ["Tandoori Roti", "Naan", "Rumali Roti", "Paratha", "Bhakri", "Kulcha", "Missi Roti", "Puri"],
  Rice: ["Biryani", "Fried Rice", "Pulao", "Khichdi", "Curd Rice", "Jeera Rice", "Vegetable Rice", "Lemon Rice"],
  FastFoods: ["Pizza", "Burger", "Sandwich", "Fries", "Pasta", "Tacos", "Hot Dog", "Nachos"],
  Desserts: ["Ice Cream", "Cake", "Pastry", "Pudding"],
  Beverages: ["Tea", "Coffee", "Juice", "Smoothie"],
};

// Days of the week for the schedule
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ChefDashboardProfile() {
  const [chefData, setChefData] = useState(null); // Original profile data from server
  const [formData, setFormData] = useState({}); // Local copy for editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const originalDataRef = useRef(null); // To track original data for comparison
  const [profileImage, setProfileImage] = useState(null); // For file upload
  const [imagePreview, setImagePreview] = useState(null); // For image preview
  const [qrCodeImage, setQRCodeImage] = useState(null); // For QR code image upload
  const [qrCodePreview, setQRCodeImagePreview] = useState(null);

  // Fetch chef profile on component mount and initialize schedule if not provided
  useEffect(() => {
    const fetchChefProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/chef/chefhprofile/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const chef = response.data.chef;
        // Initialize schedule for all days if not provided by backend
        const initializedSchedule = daysOfWeek.map((day) => ({
          day,
          isWorking: false,
          slots: [],
          ...(chef.schedule?.find((s) => s.day === day) || {}),
        }));
        const profileData = { ...chef, schedule: initializedSchedule };
        setChefData(profileData);
        setFormData(profileData);
        originalDataRef.current = profileData; // Store original data for comparison
        setLoading(false);

        // Set image preview if profile image exists
        if (chef.profileImage) {
          setImagePreview(chef.profileImage);
        }
        if(chef.qrCodeImage){
          setQRCodeImagePreview(chef.qrCodeImage);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchChefProfile();
  }, []);

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleQRCodeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQRCodeImage(file);
      const previewUrl = URL.createObjectURL(file);
      setQRCodeImagePreview(previewUrl);
    }
  };

  // Helper function to get only the changed fields
  const getChangedFields = () => {
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalDataRef.current[key])) {
        changed[key] = formData[key];
      }
    });
    return changed;
  };

  // Handle input changes for simple fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for arrays (e.g., specialties, paymentMethods)
  const handleCheckboxChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  // Handle dish field changes
  const handleDishChange = (index, field, value) => {
    const updatedDishes = formData.dishes.map((dish, i) =>
      i === index ? { ...dish, [field]: value } : dish
    );
    setFormData({ ...formData, dishes: updatedDishes });
  };

  // Add a new dish
  const addDish = () => {
    setFormData({
      ...formData,
      dishes: [
        ...(formData.dishes || []),
        { name: "", description: "", price: 0, ingredients: [], category: "", subCategory: "" },
      ],
    });
  };

  // Remove a dish
  const removeDish = (index) => {
    const updatedDishes = formData.dishes.filter((_, i) => i !== index);
    setFormData({ ...formData, dishes: updatedDishes });
  };

  // Handle schedule changes (e.g., isWorking toggle)
  const handleScheduleChange = (day, field, value) => {
    const updatedSchedule = formData.schedule.map((scheduleDay) =>
      scheduleDay.day === day ? { ...scheduleDay, [field]: value } : scheduleDay
    );
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  // Handle time slot changes
  const handleTimeSlotChange = (day, slotIndex, field, value) => {
    const updatedSchedule = formData.schedule.map((scheduleDay) => {
      if (scheduleDay.day === day) {
        const updatedSlots = scheduleDay.slots.map((slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
        );
        return { ...scheduleDay, slots: updatedSlots };
      }
      return scheduleDay;
    });
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  // Add a new time slot for a specific day
  const addTimeSlot = (day) => {
    const updatedSchedule = formData.schedule.map((scheduleDay) => {
      if (scheduleDay.day === day) {
        return {
          ...scheduleDay,
          slots: [...scheduleDay.slots, { startTime: "09:00", endTime: "10:00", maxOrders: 5 }],
        };
      }
      return scheduleDay;
    });
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  // Remove a time slot for a specific day
  const removeTimeSlot = (day, slotIndex) => {
    const updatedSchedule = formData.schedule.map((scheduleDay) => {
      if (scheduleDay.day === day) {
        const updatedSlots = scheduleDay.slots.filter((_, index) => index !== slotIndex);
        return { ...scheduleDay, slots: updatedSlots };
      }
      return scheduleDay;
    });
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  // Handle form submission using FormData for multipart/form-data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const changedFields = getChangedFields();
    if (changedFields.dishes) {
      changedFields.dishes = changedFields.dishes.map(dish => {
        const originalDish = originalDataRef.current.dishes.find(d => d._id === dish._id);
        if (!originalDish) return dish;
        const changedDishFields = {};
        if (dish._id) changedDishFields._id = dish._id;
        changedDishFields.name = dish.name;
        changedDishFields.category = dish.category;
        changedDishFields.subCategory = dish.subCategory;
        if (dish.price !== originalDish.price) changedDishFields.price = dish.price;
        if (JSON.stringify(dish.ingredients) !== JSON.stringify(originalDish.ingredients))
          changedDishFields.ingredients = dish.ingredients;
        if (dish.description !== originalDish.description)
          changedDishFields.description = dish.description;
        return changedDishFields
      })
    }
  
    if (Object.keys(changedFields).length === 0 && !profileImage && !qrCodeImage) {
      setIsEditing(!1);
      return
    }

    try {
      const formDataObj = new FormData();
      
      if (profileImage) {
        formDataObj.append('profileImage', profileImage);
      }
      
      if (qrCodeImage) {
        formDataObj.append('qrCodeImage', qrCodeImage); // ✅ this is the actual File object
      }      
  
      if (Object.keys(changedFields).length > 0) {
        Object.keys(changedFields).forEach(key => {
          if (key === 'dishes' || key === 'specialties' || key === 'paymentMethods' || key === 'schedule') {
            formDataObj.append(key, JSON.stringify(changedFields[key]))
          } else {
            formDataObj.append(key, changedFields[key])
          }
        })
      }
  
      console.log("Submitting changes:", changedFields);
      const response = await axios.patch(
        "http://localhost:8080/chef/chefhprofile/me",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setChefData(response.data.chef);
      originalDataRef.current = response.data.chef;
      setIsEditing(!1);
      setProfileImage(null);
      setQRCodeImage(null);
      // Clear the after successful submission
      setFormData(prev => ({ ...prev}));
    } catch (err) {
      if (err.response) {
        console.log("Error Response:", err.response.data);
        setError(err.response.data.message || "Error updating profile")
      } else {
        setError(err.message)
      }
    }
  };

  // Loading and error states
  if (loading) return <div className="text-center text-gray-600 py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">Error: {error}</div>;

  return (
    <div className=" min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-amber-800 p-6">
          <h2 className="text-3xl font-bold text-black text-center">Chef Dashboard</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-6 top-6 bg-white hover:bg-amber-50 text-amber-800 px-4 py-2 rounded-full font-medium transition-all shadow-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-8" encType="multipart/form-data">
            {/* Profile Section */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Personal Information</h3>

              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500 mb-4 bg-white/20">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <label className="bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-full cursor-pointer transition-colors">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Email (Read-only)</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-black font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                />
              </div>

              <div className="mt-6">
                <label className="block text-black font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Professional Details</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black font-medium mb-2">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Delivery Radius (km)</label>
                  <input
                    type="number"
                    name="deliveryRadius"
                    value={formData.deliveryRadius || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Minimum Order (<FaRupeeSign className="inline text-xs mb-1" />)</label>
                  <input
                    type="number"
                    name="minimumOrder"
                    value={formData.minimumOrder || 0}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable || false}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-14 h-7 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                    <span className="ml-3 text-black font-medium">Available for Orders</span>
                  </label>
                </div>
              </div>
              {/* Add these fields in the Professional Details section of the form */}
              {/* Place this right after the Minimum Order input field, before the isAvailable checkbox */}
              <div>
                <label className="block text-black font-medium mb-2">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-black font-medium mb-2">Payment Phone Number</label>
                <input
                  type="text"
                  name="paymentPhoneNumber"
                  value={formData.paymentPhoneNumber || ""}
                  onChange={handleInputChange}
                  placeholder="10 digits only"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                />
              </div>
              {/* <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500 mb-4 bg-white/20">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <label className="bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-full cursor-pointer transition-colors">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div> */}
              <div>
                <label className="block text-black font-medium mb-2">QR Code Image</label>
                <div className="flex items-center space-x-4">
                  { qrCodePreview? (
                    <div className="w-32 h-32 border border-white/30 bg-white/20 rounded-lg overflow-hidden">
                      <img
                        src={qrCodePreview}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 border border-white/30 bg-white/20 rounded-lg flex items-center justify-center text-gray-500">
                      No QR code
                    </div>
                  )}
                  <label className="bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-full cursor-pointer transition-colors">
                    <span>Upload QR Code</span>
                    <input
                      type="file"
                      name="qrCodeImage"
                      accept="image/*"
                      onChange={handleQRCodeImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-black font-medium mb-3">Specialties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Indian", "Mexican", "Italian", "Chinese", "Japanese", "Mediterranean", "French", "Thai", "Spanish"].map(
                      (specialty) => (
                        <label key={specialty} className="flex items-center space-x-2 text-black cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-amber-600"
                            checked={(formData.specialties || []).includes(specialty)}
                            onChange={(e) => handleCheckboxChange("specialties", specialty, e.target.checked)}
                          />
                          <span>{specialty}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-black font-medium mb-3">Payment Methods</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Cash", "Card{coming soon}", "UPI", "PayPal{coming soon}"].map((method) => (
                      <label key={method} className="flex items-center space-x-2 text-black cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-amber-600"
                          checked={(formData.paymentMethods || []).includes(method)}
                          onChange={(e) => handleCheckboxChange("paymentMethods", method, e.target.checked)}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Weekly Schedule</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {formData.schedule?.map((daySchedule) => (
                  <div key={daySchedule.day} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-black">{daySchedule.day}</h4>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={daySchedule.isWorking || false}
                          onChange={(e) => handleScheduleChange(daySchedule.day, "isWorking", e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="ml-2 text-sm font-medium text-black">Available</span>
                      </label>
                    </div>

                    {daySchedule.isWorking && (
                      <div className="space-y-2 pl-2 pt-2 border-t border-white/20">
                        {daySchedule.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={slot.startTime || ""}
                              onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "startTime", e.target.value)}
                              className="px-2 py-1 bg-white/20 border border-white/30 rounded text-black text-sm w-24"
                            />
                            <span className="text-black">-</span>
                            <input
                              type="time"
                              value={slot.endTime || ""}
                              onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "endTime", e.target.value)}
                              className="px-2 py-1 bg-white/20 border border-white/30 rounded text-black text-sm w-24"
                            />
                            <div className="flex items-center bg-white/20 border border-white/30 rounded px-2">
                              <input
                                type="number"
                                value={slot.maxOrders || 0}
                                onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "maxOrders", e.target.value)}
                                className="px-1 py-1 bg-transparent text-black text-sm w-10 focus:outline-none"
                              />
                              <span className="text-black text-xs">orders</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(daySchedule.day, slotIndex)}
                              className="text-red-300 hover:text-red-100 bg-red-500/30 rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTimeSlot(daySchedule.day)}
                          className="text-white hover:text-amber-100 text-sm font-medium flex items-center mt-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dishes */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-6 border-b border-white/30 pb-2">
                <h3 className="text-xl font-semibold text-black">Menu Items</h3>
                <button
                  type="button"
                  onClick={addDish}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-full flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Dish
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.dishes || []).map((dish, index) => (
                  <div key={index} className="bg-white/10 p-4 rounded-lg relative group">
                    <button
                      type="button"
                      onClick={() => removeDish(index)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-100 bg-red-500/20 hover:bg-red-500/40 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={dish.name || ""}
                        onChange={(e) => handleDishChange(index, "name", e.target.value)}
                        placeholder="Dish Name"
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={dish.category || ""}
                          onChange={(e) => handleDishChange(index, "category", e.target.value)}
                          className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value="" className="bg-amber-800">Select Category</option>
                          {["Veges", "Rotis", "Rice", "FastFoods", "Desserts", "Beverages"].map((cat) => (
                            <option key={cat} value={cat} className="bg-amber-800">
                              {cat}
                            </option>
                          ))}
                        </select>

                        {dish.category && (
                          <select
                            value={dish.subCategory || ""}
                            onChange={(e) => handleDishChange(index, "subCategory", e.target.value)}
                            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="" className="bg-amber-800">Select Sub-Category</option>
                            {(subCategories[dish.category] || []).map((sub) => (
                              <option key={sub} value={sub} className="bg-amber-800">
                                {sub}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-black"><FaRupeeSign className="inline text-xs mb-1" /></span>
                          <input
                            type="number"
                            value={dish.price || 0}
                            onChange={(e) => handleDishChange(index, "price", e.target.value)}
                            placeholder="Price"
                            className="w-full pl-8 pr-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                          />
                        </div>

                        <input
                          type="text"
                          value={(dish.ingredients || []).join(", ")}
                          onChange={(e) => handleDishChange(index, "ingredients", e.target.value.split(", "))}
                          placeholder="Ingredients (comma-separated)"
                          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                        />
                      </div>

                      <textarea
                        value={dish.description || ""}
                        onChange={(e) => handleDishChange(index, "description", e.target.value)}
                        placeholder="Description"
                        rows="2"
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(chefData);
                  setImagePreview(chefData.profileImage);
                  setQRCodeImagePreview(chefData.qrCodeImage);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-black px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="">
            {/* Chef Profile View */}
            <div className="overflow-hidden">
              {/* Profile Header with Image */}
              <div className="bg-amber-900/50 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-500 flex-shrink-0">
                  {chefData.profileImage ? (
                    <img
                      src={chefData.profileImage}
                      alt="Chef profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-300/20 flex items-center justify-center text-amber-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-black">{chefData.name}</h2>
                  <p className="text-white font-medium">{chefData.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <span className={`px-3 py-1 rounded-full text-sm ${chefData.isAvailable ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                      {chefData.isAvailable ? '✓ Available' : '× Not Available'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-100">
                      {chefData?.experience || 0} years exp.
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="p-6 border-b border-white/10">
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 text-black">
                  <div>
                    <h3 className="text-white text-sm uppercase font-medium mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {chefData.phone || "Not provided"}
                      </p>
                      <p className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{chefData.address || "Not provided"}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                        </svg>
                        {chefData.location || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white text-sm uppercase font-medium mb-4">Professional Details</h3>
                    <div className="space-y-3">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {chefData.deliveryRadius || 0} km radius
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Min. Order Amount: <FaRupeeSign className="inline text-xs ml-1" /> {chefData.minimumOrder || 0}
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Payment: {(chefData.paymentMethods || []).join(", ") || "None specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <h3 className="text-white text-sm uppercase font-medium mb-2">About Me</h3>
                  <p className="text-black/90 italic">
                    {chefData.bio || "No bio provided yet."}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-white text-sm uppercase font-medium mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {(chefData.specialties || []).length > 0 ? (
                    chefData.specialties.map((specialty) => (
                      <span key={specialty} className="bg-amber-600/20 text-amber-100 px-3 py-1 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className="text-black/70 italic">No specialties listed</span>
                  )}
                </div>
              </div>
              {/* Add this section after the Specialties section in the view mode */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-white text-sm uppercase font-medium mb-4">Payment Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium mr-2">UPI ID:</span>
                        <span>{chefData.upiId || "Not provided"}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-medium mr-2">Payment Phone:</span>
                        <span>{chefData.paymentPhoneNumber || "Not provided"}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    {chefData.qrCodeImage ? (
                      <div className="flex flex-col items-center">
                        <div className="w-40 h-40 border-2 border-amber-500 bg-white rounded-lg overflow-hidden">
                          <img
                            src={chefData.qrCodeImage}
                            alt="Payment QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="mt-2 text-amber-100 text-sm font-medium">Payment QR Code</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-black/70 italic">No QR code available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Schedule */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-white text-sm uppercase font-medium mb-4">Weekly Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chefData.schedule?.map((daySchedule) => (
                    <div
                      key={daySchedule.day}
                      className={`p-3 rounded-lg ${daySchedule.isWorking ? 'bg-amber-800/30' : 'bg-gray-800/20'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-black">{daySchedule.day}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${daySchedule.isWorking ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                          {daySchedule.isWorking ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </span>
                      </div>
                      {daySchedule.isWorking && daySchedule.slots.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {daySchedule.slots.map((slot, index) => (
                            <div key={index} className="flex text-sm text-black">
                              <span className="bg-amber-700/30 rounded px-2 py-1 mr-2">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="bg-amber-600/20 rounded px-2 py-1 text-white">
                                {slot.maxOrders} orders max
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : daySchedule.isWorking ? (
                        <p className="text-black/70 text-sm italic">No time slots defined</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-6">
                <h3 className="text-white text-sm uppercase font-medium mb-4">Menu Items</h3>
                {(chefData.dishes || []).length > 0 ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {chefData.dishes.map((dish) => (
                      <div key={dish._id} className="bg-white/10 rounded-lg overflow-hidden group hover:bg-white/20 transition-colors">
                        <div className="bg-amber-900/50 py-2 px-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-xs font-semibold">{dish.category}</span>
                            <span className="text-amber-100 text-xs">{dish.subCategory}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-black font-semibold">{dish.name}</h4>
                            <span className="text-black font-bold"><FaRupeeSign className="inline text-xs mb-1" />{dish.price}</span>
                          </div>
                          <p className="text-black/80 text-sm mb-3">
                            {dish.description || "No description available"}
                          </p>
                          <div className="mt-auto">
                            <h5 className="text-white text-xs font-medium mb-1">INGREDIENTS:</h5>
                            <p className="text-black/70 text-xs">
                              {(dish.ingredients || []).join(", ") || "None listed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-black/70 italic">
                    <p>No dishes have been added to your menu yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefDashboardProfile;