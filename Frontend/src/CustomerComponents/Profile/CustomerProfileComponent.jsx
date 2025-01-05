import React, { useState, useEffect } from "react";

function CustomerProfileComponent({ userId }) {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:8080/profile/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setProfile(data);
                } else {
                    setError(data.message || "Failed to fetch profile");
                }
            } catch (err) {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleUpdateProfile = async (updates) => {
        try {
            const response = await fetch(`http://localhost:8080/profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully");
                setProfile(data.profile);
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("An error occurred while updating the profile.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container">
            <h2 className="text-center">Customer Profile</h2>
            <img src={profile.img || "default.jpg"} alt="Profile" />
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>
            <p>{profile.phone || "Not provided"}</p>
            <p>{profile.address || "Not provided"}</p>
            <p>{profile.preference || "No preference"}</p>
            <button
                onClick={() =>
                    handleUpdateProfile({ name: "Updated Name", address: "Updated Address" })
                }
                className="btn btn-primary"
            >
                Update Profile
            </button>
        </div>
    );
}

export default CustomerProfileComponent;
