import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import CustomerProfileComponent from "../CustomerComponents/Profile/CustomerProfileComponent";

function Profile() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token not found");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      // Changed from userId to user_id to match the token creation
      if (!decodedToken.user_id) {
        throw new Error("Token payload does not contain user_id");
      }
      setUserId(decodedToken.user_id); // Use user_id instead of userId
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  if (!userId) {
    return <p>Loading or User not found...</p>;
  }

  return (
    <>
      <CustomerProfileComponent userId={userId} />
    </>
  );
}

export default Profile;