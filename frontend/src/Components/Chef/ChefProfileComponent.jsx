import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRupeeSign } from 'react-icons/fa';

const initialFormData = {
  profileImage: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  location: '',
  specialties: [],
  schedule: [],
  experience: 0,
  bio: '',
  isAvailable: true,
  deliveryRadius: 0,
  minimumOrder: 0,
  paymentMethods: [],
  dishes: [],
};

const subCategories = {
  Veges: ['Paneer', 'Aloo', 'Gobi', 'Bhindi', 'Palak', 'Mushroom', 'Kofta', 'Chole'],
  Rotis: ['Tandoori Roti', 'Naan', 'Rumali Roti', 'Paratha', 'Bhakri', 'Kulcha', 'Missi Roti', 'Puri'],
  Rice: ['Biryani', 'Fried Rice', 'Pulao', 'Khichdi', 'Curd Rice', 'Jeera Rice', 'Vegetable Rice', 'Lemon Rice'],
  FastFoods: ['Pizza', 'Burger', 'Sandwich', 'Fries', 'Pasta', 'Tacos', 'Hot Dog', 'Nachos'],
  Desserts: ['Ice Cream', 'Cake', 'Pastry', 'Pudding'],
  Beverages: ['Tea', 'Coffee', 'Juice', 'Smoothie'],
};

function ChefProfileComponent() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [chefData, setChefData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/chef/chefprofile/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.chef) {
          const chef = response.data.chef;
          setFormData({ ...initialFormData, ...chef });
          setChefData({ ...initialFormData, ...chef });
          setImagePreview(chef.profileImage || null);
          if (Object.keys(chef).length > 0) {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Error fetching chef profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (fieldName, value, isChecked) => {
    setFormData(prev => {
      let updatedValues = [...(prev[fieldName] || [])];
      if (isChecked) {
        updatedValues.push(value);
      } else {
        updatedValues = updatedValues.filter(item => item !== value);
      }
      return { ...prev, [fieldName]: updatedValues };
    });
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => {
      const updatedSchedule = prev.schedule.map(daySchedule =>
        daySchedule.day === day ? { ...daySchedule, [field]: value } : daySchedule
      );
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleTimeSlotChange = (day, slotIndex, field, value) => {
    setFormData(prev => {
      const updatedSchedule = prev.schedule.map(daySchedule => {
        if (daySchedule.day === day) {
          const updatedSlots = [...daySchedule.slots];
          updatedSlots[slotIndex] = { 
            ...updatedSlots[slotIndex], 
            [field]: field === 'maxOrders' ? Number(value) : value 
          };
          return { ...daySchedule, slots: updatedSlots };
        }
        return daySchedule;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const addTimeSlot = (day) => {
    setFormData(prev => {
      const updatedSchedule = prev.schedule.map(daySchedule => {
        if (daySchedule.day === day) {
          return {
            ...daySchedule,
            slots: [...daySchedule.slots, { startTime: '09:00', endTime: '17:00', maxOrders: 0 }]
          };
        }
        return daySchedule;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const removeTimeSlot = (day, slotIndex) => {
    setFormData(prev => {
      const updatedSchedule = prev.schedule.map(daySchedule => {
        if (daySchedule.day === day) {
          return {
            ...daySchedule,
            slots: daySchedule.slots.filter((_, index) => index !== slotIndex)
          };
        }
        return daySchedule;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const addScheduleDay = () => {
    setFormData(prev => {
      const existingDays = prev.schedule.map(day => day.day);
      const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const availableDays = allDays.filter(day => !existingDays.includes(day));
      if (availableDays.length === 0) return prev;
      return {
        ...prev,
        schedule: [...prev.schedule, { day: availableDays[0], isWorking: false, slots: [] }]
      };
    });
  };

  const removeScheduleDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, index) => index !== dayIndex)
    }));
  };

  const addDish = () => {
    setFormData(prev => ({
      ...prev,
      dishes: [...prev.dishes, { name: '', description: '', price: 0, ingredients: [], category: 'Veges', subCategory: '' }]
    }));
  };

  const removeDish = (dishIndex) => {
    setFormData(prev => ({
      ...prev,
      dishes: prev.dishes.filter((_, index) => index !== dishIndex)
    }));
  };

  const handleDishChange = (dishIndex, field, value) => {
    setFormData(prev => {
      const updatedDishes = [...prev.dishes];
      if (field === 'ingredients' && typeof value === 'string') {
        updatedDishes[dishIndex][field] = value.split(',').map(i => i.trim()).filter(i => i);
      } else if (field === 'price') {
        updatedDishes[dishIndex][field] = Number(value);
      } else {
        updatedDishes[dishIndex][field] = value;
      }
      return { ...prev, dishes: updatedDishes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "profileImage" && value instanceof File) {
          form.append("profileImage", value);
        } else {
          form.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        }
      });
      const response = await axios.post("http://localhost:8080/chef/chefprofile/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.chef) {
        setChefData(response.data.chef);
        setIsEditing(false);
        setTimeout(() => {
          navigate("/chef");
        }, 5000); // Add this line to navigate after success
      }
    } catch (error) {
      console.error("Error saving chef profile:", error);
      setErrors({ submit: error.response?.data?.message || "Failed to save profile" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-amber-800 p-6">
          <h2 className="text-3xl font-bold text-black text-center">Chef Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-6 top-6 bg-white hover:bg-amber-50 text-amber-800 px-4 py-2 rounded-full font-medium transition-all shadow-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-8" encType="multipart/form-data">
            {errors.submit && <p className="text-red-500 text-center mb-4">{errors.submit}</p>}
            
            {/* Personal Info Section */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Personal Information</h3>
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500 mb-4 bg-white/20">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>
                <label className="bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-full cursor-pointer transition-colors">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" />
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
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Email (Read-only)</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300" />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Phone (10 digits)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-black font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
              </div>
              <div className="mt-6">
                <label className="block text-black font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
              </div>
            </div>
            
            {/* Professional Details Section */}
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
                    min="0"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Delivery Radius (km)</label>
                  <input
                    type="number"
                    name="deliveryRadius"
                    value={formData.deliveryRadius || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">Minimum Order (<FaRupeeSign className="inline text-xs mb-1" />)</label>
                  <input
                    type="number"
                    name="minimumOrder"
                    value={formData.minimumOrder || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable || false}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                      className="sr-only peer" />
                    <div className="relative w-14 h-7 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                    <span className="ml-3 text-black font-medium">Available for Orders</span>
                  </label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-black font-medium mb-3">Specialties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Indian', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Mediterranean', 'French', 'Thai', 'Spanish'].map((specialty) => (
                      <label key={specialty} className="flex items-center space-x-2 text-black cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-amber-600"
                          checked={(formData.specialties || []).includes(specialty)}
                          onChange={(e) => handleCheckboxChange("specialties", specialty, e.target.checked)} />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-black font-medium mb-3">Payment Methods</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cash', 'Card{coming soon}', 'UPI', 'PayPal{coming soon}'].map((method) => (
                      <label key={method} className="flex items-center space-x-2 text-black cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-amber-600"
                          checked={(formData.paymentMethods || []).includes(method)}
                          onChange={(e) => handleCheckboxChange("paymentMethods", method, e.target.checked)} />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Schedule Section */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-6 border-b border-white/30 pb-2">
                <h3 className="text-xl font-semibold text-black">Weekly Schedule</h3>
                <button
                  type="button"
                  onClick={addScheduleDay}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-full flex items-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Day
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.schedule?.map((daySchedule, dayIndex) => (
                  <div key={daySchedule.day} className="bg-white/10 p-4 rounded-lg relative">
                    <button
                      type="button"
                      onClick={() => removeScheduleDay(dayIndex)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-100 bg-red-500/20 hover:bg-red-500/40 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
                      ✕
                    </button>
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={daySchedule.day || 'Monday'}
                        onChange={(e) => {
                          const updatedSchedule = [...formData.schedule];
                          updatedSchedule[dayIndex].day = e.target.value;
                          setFormData({...formData, schedule: updatedSchedule});
                        }}
                        className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={daySchedule.isWorking || false}
                          onChange={(e) => handleScheduleChange(daySchedule.day, "isWorking", e.target.checked)} />
                        <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="ml-2 text-sm font-medium text-black">Available</span>
                      </label>
                    </div>
                    {daySchedule.isWorking && (
                      <div className="space-y-2 pl-2 pt-2 border-t border-white/20">
                        {daySchedule.slots && daySchedule.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={slot.startTime || "09:00"}
                              onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "startTime", e.target.value)}
                              className="px-2 py-1 bg-white/20 border border-white/30 rounded text-black text-sm w-24" />
                            <span className="text-black">-</span>
                            <input
                              type="time"
                              value={slot.endTime || "17:00"}
                              onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "endTime", e.target.value)}
                              className="px-2 py-1 bg-white/20 border border-white/30 rounded text-black text-sm w-24" />
                            <div className="flex items-center bg-white/20 border border-white/30 rounded px-2">
                              <input
                                type="number"
                                value={slot.maxOrders || 0}
                                onChange={(e) => handleTimeSlotChange(daySchedule.day, slotIndex, "maxOrders", e.target.value)}
                                className="px-1 py-1 bg-transparent text-black text-sm w-10 focus:outline-none" />
                              <span className="text-black text-xs">orders</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(daySchedule.day, slotIndex)}
                              className="text-red-300 hover:text-red-100 bg-red-500/30 rounded-full w-6 h-6 flex items-center justify-center">
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTimeSlot(daySchedule.day)}
                          className="text-white hover:text-amber-100 text-sm font-medium flex items-center mt-2">
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
            
            {/* Menu Items Section */}
            <div className="bg-white/20 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-6 border-b border-white/30 pb-2">
                <h3 className="text-xl font-semibold text-black">Menu Items</h3>
                <button
                  type="button"
                  onClick={addDish}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-full flex items-center transition-colors">
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
                      className="absolute top-2 right-2 text-red-400 hover:text-red-100 bg-red-500/20 hover:bg-red-500/40 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
                      ✕
                    </button>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={dish.name || ""}
                        onChange={(e) => handleDishChange(index, "name", e.target.value)}
                        placeholder="Dish Name"
                        required
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={dish.category || ""}
                          onChange={(e) => handleDishChange(index, "category", e.target.value)}
                          className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none">
                          <option value="" className="bg-amber-800">Select Category</option>
                          {['Veges', 'Rotis', 'Rice', 'FastFoods', 'Desserts', 'Beverages'].map((cat) => (
                            <option key={cat} value={cat} className="bg-amber-800">{cat}</option>
                          ))}
                        </select>
                        <select
                          value={dish.subCategory || ""}
                          onChange={(e) => handleDishChange(index, "subCategory", e.target.value)}
                          className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none">
                          <option value="" className="bg-amber-800">Select Sub-Category</option>
                          {dish.category && subCategories[dish.category]?.map((sub) => (
                            <option key={sub} value={sub} className="bg-amber-800">{sub}</option>))}</select></div><div className="flex items-center space-x-2"><input
type="number"
value={dish.price || 0}
onChange={(e)=>handleDishChange(index, "price", e.target.value)}
placeholder="Price"
required
min="0"
className="w-1/3 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:outline-none"/>
<span className="text-black font-medium flex items-center"><FaRupeeSign className="mr-1" />Price</span>
</div>
<textarea
value={dish.description || ""}
onChange={(e)=>handleDishChange(index, "description", e.target.value)}
placeholder="Description"
rows="2"
className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"/>
<input
type="text"
value={dish.ingredients ? (Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : dish.ingredients) : ""}
onChange={(e)=>handleDishChange(index, "ingredients", e.target.value)}
placeholder="Ingredients (comma-separated)"
className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-black focus:ring-2 focus:ring-amber-500 focus:bg-white/30 focus:outline-none"/>
</div>
</div>
))}</div>
</div>

<div className="mt-8 flex justify-end">
<button
type="submit"
disabled={isLoading}
className="bg-amber-600 hover:bg-amber-700 text-black py-3 px-8 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 flex items-center">
{isLoading ? (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
) : (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
  </svg>
)}
{isLoading ? 'Saving...' : 'Save Profile'}
</button>
</div>
</form>
) : (
// View Mode - Profile Display
<div className="p-6 space-y-8">
<div className="bg-white/20 rounded-xl p-6 shadow-md">
<h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Personal Information</h3>
<div className="flex flex-col md:flex-row gap-8">
<div className="flex flex-col items-center">
<div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500 mb-4 bg-white/20">
{chefData.profileImage ? (
  <img src={chefData.profileImage} alt="Profile" className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">No image</div>
)}
</div>
{chefData.averageRating && (
  <div className="flex items-center mt-2">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-5 h-5 ${i < Math.round(chefData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
           fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    ))}
    <span className="ml-2 text-sm font-medium text-gray-800">({chefData.reviewCount} reviews)</span>
  </div>
)}
</div>
<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<p className="text-gray-600 text-sm">Name</p>
<p className="font-medium text-black">{chefData.name || "Not provided"}</p>
</div>
<div>
<p className="text-gray-600 text-sm">Email</p>
<p className="font-medium text-black">{chefData.email || "Not provided"}</p>
</div>
<div>
<p className="text-gray-600 text-sm">Phone</p>
<p className="font-medium text-black">{chefData.phone || "Not provided"}</p>
</div>
<div>
<p className="text-gray-600 text-sm">Location</p>
<p className="font-medium text-black">{chefData.location || "Not provided"}</p>
</div>
</div>
</div>
<div className="mt-4">
<p className="text-gray-600 text-sm">Address</p>
<p className="font-medium text-black">{chefData.address || "Not provided"}</p>
</div>
<div className="mt-4">
<p className="text-gray-600 text-sm">Bio</p>
<p className="font-medium text-black whitespace-pre-line">{chefData.bio || "No bio provided"}</p>
</div>
</div>

<div className="bg-white/20 rounded-xl p-6 shadow-md">
<h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Professional Details</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div>
<p className="text-gray-600 text-sm">Experience</p>
<p className="font-medium text-black">{chefData.experience || 0} years</p>
</div>
<div>
<p className="text-gray-600 text-sm">Delivery Radius</p>
<p className="font-medium text-black">{chefData.deliveryRadius || 0} km</p>
</div>
<div>
<p className="text-gray-600 text-sm">Minimum Order</p>
<p className="font-medium text-black flex items-center"><FaRupeeSign className="mr-1" /> {chefData.minimumOrder || 0}</p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
<div>
<p className="text-gray-600 text-sm mb-2">Specialties</p>
{chefData.specialties && chefData.specialties.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {chefData.specialties.map(specialty => (
      <span key={specialty} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
        {specialty}
      </span>
    ))}
  </div>
) : (
  <p className="text-gray-500 italic">No specialties listed</p>
)}
</div>
<div>
<p className="text-gray-600 text-sm mb-2">Payment Methods</p>
{chefData.paymentMethods && chefData.paymentMethods.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {chefData.paymentMethods.map(method => (
      <span key={method} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
        {method}
      </span>
    ))}
  </div>
) : (
  <p className="text-gray-500 italic">No payment methods listed</p>
)}
</div>
</div>

<div className="mt-4 flex items-center">
<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${chefData.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
  <span className={`w-2 h-2 mr-2 rounded-full ${chefData.isAvailable ? 'bg-green-600' : 'bg-red-600'}`}></span>
  {chefData.isAvailable ? 'Available for Orders' : 'Not Available'}
</span>
</div>
</div>

<div className="bg-white/20 rounded-xl p-6 shadow-md">
<h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Weekly Schedule</h3>
{chefData.schedule && chefData.schedule.length > 0 ? (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {chefData.schedule.map((day, index) => (
      <div key={index} className={`rounded-lg p-4 ${day.isWorking ? 'bg-white/10' : 'bg-gray-200/20'}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-black">{day.day}</h4>
          <span className={`px-2 py-1 rounded text-xs font-medium ${day.isWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {day.isWorking ? 'Available' : 'Closed'}
          </span>
        </div>
        {day.isWorking && day.slots && day.slots.length > 0 ? (
          <div className="space-y-1 mt-2 border-t border-white/10 pt-2">
            {day.slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{slot.startTime} - {slot.endTime}</span>
                <span className="text-gray-600 bg-white/30 px-2 py-0.5 rounded">Max: {slot.maxOrders} orders</span>
              </div>
            ))}
          </div>
        ) : day.isWorking ? (
          <p className="text-gray-500 italic text-sm mt-2">No time slots defined</p>
        ) : null}
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500 italic">No schedule defined</p>
)}
</div>

<div className="bg-white/20 rounded-xl p-6 shadow-md">
<h3 className="text-xl font-semibold text-black mb-6 border-b border-white/30 pb-2">Menu Items</h3>
{chefData.dishes && chefData.dishes.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {chefData.dishes.map((dish, index) => (
      <div key={index} className="bg-white/10 rounded-lg p-4 hover:shadow-lg transition-all">
        <h4 className="font-medium text-lg text-black">{dish.name}</h4>
        <div className="flex items-center mt-1 mb-2">
          <span className="text-amber-800 font-bold flex items-center">
            <FaRupeeSign className="mr-0.5" /> {dish.price}
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-600 text-sm">{dish.category} - {dish.subCategory}</span>
        </div>
        <p className="text-gray-700 text-sm mb-2">{dish.description}</p>
        {dish.ingredients && dish.ingredients.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">Ingredients:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {dish.ingredients.map((ingredient, i) => (
                <span key={i} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500 italic">No dishes added</p>
)}
</div>
</div>
)}
</div>
</div>
);
}

export default ChefProfileComponent;