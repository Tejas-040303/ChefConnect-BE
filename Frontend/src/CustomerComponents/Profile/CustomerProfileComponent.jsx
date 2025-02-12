import React, { useState, useEffect } from "react";
import "../../../public/css/CustomerCss/CustomerProfileComponent.css";

function CustomerProfileComponent({ userId }) {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editableFields, setEditableFields] = useState({
        name: "",
        phone: "",
        address: "",
        preference: "",
        img: null,
    });

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    // Fetch profile changes
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token || token === 'undefined' || token === 'null') {
                localStorage.removeItem("token");
                throw new Error("No valid authentication token found");
            }

            const response = await fetch("http://localhost:8080/profile/customerprofile", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }); // Removed body as userId is already in the token

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch profile");
            }

            const data = await response.json();

            if (!data.success || !data.profile) {
                throw new Error("Profile data not found");
            }

            setProfile(data.profile);
            setEditableFields({
                name: data.profile.name || "",
                phone: data.profile.phone || "",
                address: data.profile.address || "",
                preference: data.profile.preference || "",
                img: null,
            });

        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableFields((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditableFields((prev) => ({
                ...prev,
                img: e.target.files[0],
            }));
        }
    };

    // Update profile changes
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            // Validate phone number
            if (editableFields.phone && editableFields.phone.length !== 10) {
                throw new Error("Phone number must be exactly 10 digits");
            }

            const formData = new FormData();
    
            // Append all fields (including name)
            formData.append("name", editableFields.name);
            formData.append("phone", editableFields.phone);
            formData.append("address", editableFields.address);
            formData.append("preference", editableFields.preference);
            
            if (editableFields.img instanceof File) {
              formData.append("profileImage", editableFields.img);
            }
        
            const response = await fetch("http://localhost:8080/profile/customerprofileupdate", {
              method: "PUT",
              headers: { "Authorization": `Bearer ${token}` },
              body: formData, // No Content-Type header for FormData
            });


            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            if (data.success) {
                setProfile(data.profile);
                setIsEditing(false);
                // Refresh the profile data
                await fetchProfile();
                alert("Profile updated successfully");
            } else {
                throw new Error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert(error.message || "An error occurred while updating the profile.");
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div className="container my-5">

            {/* Rest of the JSX remains the same */}
            <div className="profile-container">
                <h2 className="text-center customer-text mb-4">{profile?.name}'s Profile</h2>

                <div className="form customer-form">
                    {/* Profile Image Section */}
                    <div className="row g-3 align-items-center" style={{ width: "100%" }}>
                        <div className="col-auto">
                            <img
                                src={profile?.img || "../../../public/person.jpg"}
                                alt="Profile"
                                className="col-form-label customer-image"
                                style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                            />
                        </div>
                        <div className={`col-auto customer-image-input ${isEditing ? "editing" : ""}`}>
                            {isEditing && (
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="form-control"
                                />
                            )}
                        </div>
                    </div>

                    {/* Name Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Name:</label>
                        </div>
                        <div className="col-auto">
                            <input
                                type="text"
                                name="name"
                                value={isEditing ? editableFields.name : profile?.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="form-control customer-input"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Email:</label>
                        </div>
                        <div className="col-auto">
                            <input
                                type="email"
                                value={profile?.email}
                                disabled
                                className="form-control customer-input"
                            />
                        </div>
                    </div>

                    {/* Role Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Role:</label>
                        </div>
                        <div className="col-auto">
                            <input
                                type="text"
                                value={profile?.role}
                                disabled
                                className="form-control customer-input"
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Phone:</label>
                        </div>
                        <div className="col-auto">
                            <input
                                type="text"
                                name="phone"
                                value={isEditing ? editableFields.phone : profile?.phone || "Not provided"}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="form-control customer-input"
                            />
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Address:</label>
                        </div>
                        <div className="col-auto">
                            <input
                                type="text"
                                name="address"
                                value={isEditing ? editableFields.address : profile?.address || "Not provided"}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="form-control customer-input"
                            />
                        </div>
                    </div>

                    {/* Preference Field */}
                    <div className="row g-3 align-items-center mt-3">
                        <div className="col-auto">
                            <label className="col-form-label customer-label">Preference:</label>
                        </div>
                        <div className="col-auto">
                            {isEditing ? (
                                <select
                                    name="preference"
                                    value={editableFields.preference}
                                    onChange={handleInputChange}
                                    className="form-control customer-input"
                                >
                                    <option value="">Select Preference</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.preference || "No preference"}
                                    disabled
                                    className="form-control customer-input"
                                />
                            )}
                        </div>
                    </div>

                    {/* Edit/Save Buttons */}
                    <div className="mt-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary customer-btn"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="d-flex justify-content-between change-btn-div">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="btn btn-success"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditableFields({
                                            name: profile?.name,
                                            phone: profile?.phone || "",
                                            address: profile?.address || "",
                                            preference: profile?.preference || "",
                                            img: null,
                                        });
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerProfileComponent;