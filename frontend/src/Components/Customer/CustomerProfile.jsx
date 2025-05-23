import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import customerPhoto from '../../assets/customerProfile.jpeg';

function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [specialtiesError, setSpecialtiesError] = useState('');
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  
  const DELIVERY_INSTRUCTIONS_CHAR_LIMIT = 500;
  const DEFAULT_PROFILE_IMAGE = customerPhoto;
  const availableSpecialties = ['Indian', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Mediterranean', 'French', 'Thai', 'Spanish'];
  const MAX_SPECIALTIES = 3;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/customer/customerprofile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        setProfile(response.data.customer);
        setFormData(response.data.customer);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data.message || err.message);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'loyaltyPoints') return;
    if (name === 'deliveryInstructions' && value.length > DELIVERY_INSTRUCTIONS_CHAR_LIMIT) {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    if (field === "specialtiesPreferences") {
      const currentSpecialties = formData[field] || [];
      if (checked) {
        if (currentSpecialties.length >= MAX_SPECIALTIES) {
          setSpecialtiesError(`You can select a maximum of ${MAX_SPECIALTIES} cuisine specialties.`);
          return;
        }
        setSpecialtiesError('');
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveProfileImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.post(
        'http://localhost:8080/customer/customerprofile/upload-profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      setIsUploading(false);
      setUploadProgress(0);
      return response.data.imageUrl;
    } catch (err) {
      setError('Failed to upload image: ' + (err.response?.data.message || err.message));
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveProfileImage(false);
  };

  const handleRemoveProfileImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveProfileImage(true);
  };

  // New function to call the backend delete endpoint
  const deleteProfileImage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8080/customer/customerprofile/profile-image', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch (err) {
      setError('Failed to remove profile image: ' + (err.response?.data.message || err.message));
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedFormData = { ...formData };
      const token = localStorage.getItem('token');

      // Handle image operations
      if (imageFile) {
        // If there's a new image file, upload it
        const imageUrl = await handleImageUpload();
        if (imageUrl) {
          updatedFormData.img = imageUrl;
        }
      } else if (removeProfileImage) {
        // If user requested to remove profile image
        const success = await deleteProfileImage();
        if (success) {
          // After successful deletion, set the default image in the form data
          updatedFormData.img = null;
        }
      }

      // Update the profile with the new data
      const response = await axios.patch(
        'http://localhost:8080/customer/customerprofile/me',
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update state with the response
      setProfile(response.data.customer);
      setIsEditing(false);
      setError(null);
      clearImageSelection();
      setSpecialtiesError('');
      setRemoveProfileImage(false);
    } catch (err) {
      setError(err.response?.data.message || err.message);
    }
  };

  const currentDeliveryInstructionsLength = formData.deliveryInstructions ? formData.deliveryInstructions.length : 0;
  const remainingChars = DELIVERY_INSTRUCTIONS_CHAR_LIMIT - currentDeliveryInstructionsLength;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10 max-w-md mx-auto bg-red-50 rounded-lg shadow p-6 mt-10">
        <h3 className="text-lg font-semibold mb-2">Error Occurred</h3>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen py-8 px-4 mb-12">
      <div className="max-w-4xl mx-auto bg-white/50 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-6">
          <h2 className="text-3xl font-bold text-white text-center">My Profile</h2>
        </div>

        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  {(imagePreview || (formData.img && !removeProfileImage)) ? (
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-amber-300">
                      <img
                        src={imagePreview || formData.img}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      {imagePreview && imagePreview !== DEFAULT_PROFILE_IMAGE && (
                        <button
                          type="button"
                          onClick={clearImageSelection}
                          className="absolute top-0 right-0 bg-red-500 p-1 rounded-full text-white"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center border-4 border-amber-300">
                      <Camera size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload size={18} />
                    <span>Upload Photo</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {formData.img && !imageFile && !removeProfileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                  
                  {removeProfileImage && formData.img && (
                    <button
                      type="button"
                      onClick={() => setRemoveProfileImage(false)}
                      className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>Cancel Removal</span>
                    </button>
                  )}
                  
                  {imageFile && (
                    <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>
                  )}
                  
                  {isUploading && (
                    <div className="w-full">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rest of the form remains the same */}
              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email (Read-only):</label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone:</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Address:</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Meal Preference:</label>
                    <select
                      name="preference"
                      value={formData.preference || "None"}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="None">None</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Notification Preference:</label>
                    <select
                      name="notificationPreferences"
                      value={formData.notificationPreferences || "Push"}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Push">Push</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Loyalty Points:</label>
                    <input
                      type="number"
                      name="loyaltyPoints"
                      value={formData.loyaltyPoints || 0}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Delivery Instructions(Grocery):
                      <span className="text-sm text-gray-500 ml-2">(Max {DELIVERY_INSTRUCTIONS_CHAR_LIMIT} characters)</span>
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions || ""}
                      onChange={handleInputChange}
                      rows="3"
                      maxLength={DELIVERY_INSTRUCTIONS_CHAR_LIMIT}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        remainingChars < 50 ? 'focus:ring-amber-300' : 'focus:ring-amber-500'
                      } ${remainingChars < 20 ? 'border-red-300' : ''}`}
                    ></textarea>
                    <div className="flex justify-end mt-1">
                      <span className={`text-sm ${
                        remainingChars < 20 ? 'text-red-500' : 
                        remainingChars < 50 ? 'text-amber-500' : 
                        'text-gray-500'
                      }`}>
                        {currentDeliveryInstructionsLength}/{DELIVERY_INSTRUCTIONS_CHAR_LIMIT} ({remainingChars} characters remaining)
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Cuisine Specialties Preference:
                      <span className="text-sm text-gray-500 ml-2">(Select up to {MAX_SPECIALTIES})</span>
                    </label>
                    {specialtiesError && (
                      <p className="text-red-500 text-sm mb-2">{specialtiesError}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {availableSpecialties.map((specialty) => {
                        const isChecked = (formData.specialtiesPreferences || []).includes(specialty);
                        const isDisabled = !isChecked && (formData.specialtiesPreferences || []).length >= MAX_SPECIALTIES;
                        return (
                          <label
                            key={specialty}
                            className={`flex items-center space-x-2 py-1 ${isDisabled ? 'opacity-50' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => handleCheckboxChange("specialtiesPreferences", specialty, e.target.checked)}
                              className="rounded text-amber-500 focus:ring-amber-500"
                            />
                            <span>{specialty}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {(formData.specialtiesPreferences || []).length}/{MAX_SPECIALTIES}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Dietary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Allergies:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Peanuts', 'Gluten', 'Dairy', 'Shellfish', 'Eggs', 'Soy', 'Tree Nuts'].map((allergy) => (
                        <label key={allergy} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={(formData.allergies || []).includes(allergy)}
                            onChange={(e) => handleCheckboxChange("allergies", allergy, e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span>{allergy}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Dietary Restrictions:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Low-Carb', 'Low-Fat', 'Low-Sodium', 'Halal', 'Kosher', 'Gluten-Free', 'Paleo', 'Keto'].map((restriction) => (
                        <label key={restriction} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={(formData.dietaryRestrictions || []).includes(restriction)}
                            onChange={(e) => handleCheckboxChange("dietaryRestrictions", restriction, e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span>{restriction}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    clearImageSelection();
                    setSpecialtiesError('');
                    setRemoveProfileImage(false);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-300 flex-shrink-0">
                  {profile.img ? (
                    <img
                      src={profile.img}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Camera size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-800">{profile.name}</h3>
                  <p className="text-amber-500 font-medium">{profile.loyaltyPoints} Loyalty Points</p>
                  <p className="text-gray-600 mt-2">{profile.email}</p>
                  <p className="text-gray-600">{profile.phone || "No phone number provided"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Personal Information</h3>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="mb-3">
                    <span className="font-semibold text-gray-700">Address:</span>{" "}
                    {profile.address || "Not provided"}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-gray-700">Delivery Instructions(Grocery):</span>{" "}
                    {profile.deliveryInstructions || "None"}
                    <span className="text-xs text-gray-500 ml-2">
                      ({profile.deliveryInstructions ? profile.deliveryInstructions.length : 0}/{DELIVERY_INSTRUCTIONS_CHAR_LIMIT} chars)
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-gray-700">Meal Preference</p>
                    <p className="text-lg">{profile.preference || "None"}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-gray-700">Notification Preference</p>
                    <p className="text-lg">{profile.notificationPreferences || "None"}</p>
                  </div>
                  <div className="sm:col-span-2 bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-gray-700 mb-2">
                      Cuisine Specialties Preference
                      <span className="text-xs text-gray-500">(Max {MAX_SPECIALTIES})</span>
                    </p>
                    {profile.specialtiesPreferences && profile.specialtiesPreferences.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.specialtiesPreferences.map(specialty => (
                          <span key={specialty} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None selected</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-amber-600 mb-4 border-b border-amber-200 pb-2">Dietary Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-gray-700 mb-2">Allergies</p>
                    {profile.allergies && profile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.allergies.map(allergy => (
                          <span key={allergy} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None</p>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-gray-700 mb-2">Dietary Restrictions</p>
                    {profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.dietaryRestrictions.map(restriction => (
                          <span key={restriction} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;