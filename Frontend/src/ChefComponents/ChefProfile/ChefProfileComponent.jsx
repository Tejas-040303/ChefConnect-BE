// frontend/src/components/Chef/ChefProfileComponent.jsx
import React, { useState, useEffect } from "react";
import "../../../public/css/ChefCss/ChefProfile.css";

const SPECIALTIES_OPTIONS = [
  "Indian", "Mexican", "Italian", "Chinese", 
  "Japanese", "Mediterranean", "French", "Thai", "Spanish"
];

const DISH_CATEGORIES = {
  rotis: ["Tandoori Roti", "Naan", "Rumali Roti", "Paratha", "Bhakri", "Kulcha", "Missi Roti", "Puri"],
  rice: ["Biryani", "Fried Rice", "Pulao", "Khichdi", "Curd Rice", "Jeera Rice", "Vegetable Rice", "Lemon Rice"],
  fastFoods: ["Pizza", "Burger", "Sandwich", "Fries", "Pasta", "Tacos", "Hot Dog", "Nachos"]
};

function ChefProfileComponent() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});
  const [editableFields, setEditableFields] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    address: "",
    specialties: [],
    dishes: { rotis: [], rice: [], fastFoods: [] },
    schedule: []
  });

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    specialties: true,
    dishes: true,
    schedule: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/profile/chefprofile", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        const profileData = data.profile;
        setProfile(profileData);
        setOriginalProfile(profileData);
        setEditableFields({
          name: profileData.name,
          email: profileData.email,
          location: profileData.location,
          phone: profileData.phone || "",
          address: profileData.address || "",
          specialties: profileData.specialties || [],
          dishes: profileData.dishes || { rotis: [], rice: [], fastFoods: [] },
          schedule: profileData.schedule
        });
      } else {
        setError(data.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    const originalSubset = {
      name: originalProfile.name,
      email: originalProfile.email,
      location: originalProfile.location,
      phone: originalProfile.phone || "",
      address: originalProfile.address || "",
      specialties: originalProfile.specialties || [],
      dishes: originalProfile.dishes || { rotis: [], rice: [], fastFoods: [] },
      schedule: originalProfile.schedule || []
    };
    return JSON.stringify(editableFields) !== JSON.stringify(originalSubset);
  };

  const handleSpecialtyChange = (specialty, checked) => {
    setEditableFields(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleDishChange = (category, dish, checked) => {
    setEditableFields(prev => ({
      ...prev,
      dishes: {
        ...prev.dishes,
        [category]: checked
          ? [...prev.dishes[category], dish]
          : prev.dishes[category].filter(d => d !== dish)
      }
    }));
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    const newSchedule = [...editableFields.schedule];
    newSchedule[dayIndex][field] = value;
    setEditableFields(prev => ({ ...prev, schedule: newSchedule }));
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    const newSchedule = [...editableFields.schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setEditableFields(prev => ({ ...prev, schedule: newSchedule }));
  };

  const addTimeSlot = (dayIndex) => {
    const newSchedule = [...editableFields.schedule];
    newSchedule[dayIndex].slots.push({
      startTime: "09:00",
      endTime: "10:00",
      maxOrders: 5
    });
    setEditableFields(prev => ({ ...prev, schedule: newSchedule }));
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!hasChanges()) {
    //   setIsEditing(true);
    //   return;
    // }
  
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Required fields validation
      if (!editableFields.name.trim() || !editableFields.location.trim()) {
        alert("Name and location are required fields");
        return;
      }
  
      // Append data with validation
      formData.append("name", editableFields.name.trim());
      formData.append("location", editableFields.location.trim());
      formData.append("phone", editableFields.phone?.trim() || "");
      formData.append("address", editableFields.address?.trim() || "");
      formData.append("specialties", JSON.stringify(editableFields.specialties || []));
      formData.append("dishes", JSON.stringify(editableFields.dishes || {}));
      formData.append("schedule", JSON.stringify(editableFields.schedule || []));

      const response = await fetch("http://localhost:8080/profile/chefprofileupdate", {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
  
      const data = await response.json();
   
      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }
  
      setProfile(data.profile);
      setOriginalProfile(data.profile);
      setIsEditing(false);
      alert("Profile updated successfully!");
  
    } catch (err) {
      alert(err.message || "Error updating profile");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chef-profile-container">
      <form >
        {/* Basic Info Section */}
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('basicInfo')}>
            <h3>Basic Information</h3>
            <span className="toggle-icon">{expandedSections.basicInfo ? '▼' : '▶'}</span>
          </div>
          {expandedSections.basicInfo && (
            <div className="section-content">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editableFields.name}
                  onChange={e => setEditableFields({ ...editableFields, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <div className="static-field">{editableFields.email}</div>
              </div>
              <div className="form-group">
                <label>Location:</label>
                <div className="static-field">{editableFields.location}</div>
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={editableFields.phone}
                  onChange={e => setEditableFields({ ...editableFields, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  value={editableFields.address}
                  onChange={e => setEditableFields({ ...editableFields, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}
        </div>

        {/* Specialties Section */}
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('specialties')}>
            <h3>Cuisine Specialties</h3>
            <span className="toggle-icon">{expandedSections.specialties ? '▼' : '▶'}</span>
          </div>
          {expandedSections.specialties && (
            <div className="section-content">
              <div className="dish-options">
                {SPECIALTIES_OPTIONS.map(specialty => (
                  <label key={specialty} className="dish-option">
                    <input
                      type="checkbox"
                      checked={editableFields.specialties.includes(specialty)}
                      onChange={e => handleSpecialtyChange(specialty, e.target.checked)}
                      disabled={!isEditing}
                    />
                    {specialty}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dishes Section */}
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('dishes')}>
            <h3>Dish Specialties</h3>
            <span className="toggle-icon">{expandedSections.dishes ? '▼' : '▶'}</span>
          </div>
          {expandedSections.dishes && (
            <div className="section-content">
              {Object.entries(DISH_CATEGORIES).map(([category, dishes]) => (
                <div key={category} className="dish-category">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}:</h4>
                  <div className="dish-options">
                    {dishes.map(dish => (
                      <label key={dish} className="dish-option">
                        <input
                          type="checkbox"
                          checked={editableFields.dishes[category]?.includes(dish)}
                          onChange={e => handleDishChange(category, dish, e.target.checked)}
                          disabled={!isEditing}
                        />
                        {dish}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="section">
          <div className="section-header" onClick={() => toggleSection('schedule')}>
            <h3>Weekly Schedule</h3>
            <span className="toggle-icon">{expandedSections.schedule ? '▼' : '▶'}</span>
          </div>
          {expandedSections.schedule && (
            <div className="section-content">
              {editableFields.schedule.map((day, dayIndex) => (
                <div key={day.day} className="day-schedule">
                  <h4>{day.day}</h4>
                  <label>
                    <input
                      type="checkbox"
                      checked={day.isWorking}
                      onChange={e => handleScheduleChange(dayIndex, 'isWorking', e.target.checked)}
                      disabled={!isEditing}
                    />
                    Available
                  </label>

                  {day.isWorking && (
                    <div className="time-slots">
                      {day.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-slot">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={e => handleTimeSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                            disabled={!isEditing}
                          />
                          <span> to </span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={e => handleTimeSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                            disabled={!isEditing}
                          />
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={slot.maxOrders}
                            onChange={e => handleTimeSlotChange(dayIndex, slotIndex, 'maxOrders', parseInt(e.target.value))}
                            disabled={!isEditing}
                            placeholder="Max orders"
                          />
                        </div>
                      ))}
                      {isEditing && (
                        <button type="button" onClick={() => addTimeSlot(dayIndex)}>
                          Add Time Slot
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="actions">
          {!isEditing ? (
            <button type="button" onClick={(e) =>{
                e.preventDefault()
              setIsEditing(true)
            }}>
              Edit Profile
            </button>
          ) : (
            <>
              <button type="submit" onClick={handleSubmit}>Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChefProfileComponent;