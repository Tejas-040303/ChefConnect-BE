import React, { useState, useEffect } from "react";
import axios from "axios";

function CustomerProfileComponent({ userId }) {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/profile/${userId}`);
                setProfile(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleUpdateProfile = async (updates) => {
        try {
            const response = await axios.put(`http://localhost:8080/profile/${userId}`, updates);
            alert("Profile updated successfully");
            setProfile(response.data.profile);
        } catch (err) {
            console.error("Update error:", err);
            alert(err.response?.data?.message || "An error occurred while updating the profile.");
        }
    };

    if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status"></div><p>Loading...</p></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Customer Profile</h2>
            <div className="card shadow p-4">
                <div className="text-center">
                    <img
                        src={profile.img || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="img-fluid rounded-circle mb-3"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                </div>
                <h3 className="text-center">{profile.name}</h3>
                <p className="text-muted text-center">{profile.email}</p>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <strong>Phone:</strong> {profile.phone || "Not provided"}
                    </li>
                    <li className="list-group-item">
                        <strong>Address:</strong> {profile.address || "Not provided"}
                    </li>
                    <li className="list-group-item">
                        <strong>Preference:</strong> {profile.preference || "No preference"}
                    </li>
                </ul>
                <button
                    onClick={() =>
                        handleUpdateProfile({
                            name: "Updated Name",
                            address: "Updated Address",
                        })
                    }
                    className="btn btn-primary w-100 mt-3"
                >
                    Update Profile
                </button>
            </div>
        </div>
    );
}

export default CustomerProfileComponent;
