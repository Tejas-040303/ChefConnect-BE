import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../public/css/CommanCss/SignupComponent.css";

function SignupComponent() {
  const [selectedRole, setSelectedRole] = useState("");
  const [location, setLocation] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleRoleSelection = (e) => {
    setSelectedRole(e.target.value);
    if (e.target.value !== "Chef") setLocation(""); // Clear location if not Chef
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      role: selectedRole,
      location: selectedRole === "Chef" ? location : undefined,
    };

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setErrorMessage("");
        if (data.role === "Customer" || data.role === "Chef") {
          navigate("/login");
        }
      } else {
        setErrorMessage(data.error || data.message);
        setSuccessMessage("");
      }
    } catch (err) {
      setErrorMessage("Failed to signup. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="image-section">
          <img
            src="../../public/Food1.png"
            alt="Delicious Food"
            className="side-image"
          />
        </div>
        <div className="signup-right">
          <div className="signup-form-inner">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit}>
              <h2 className="form-title">Signup</h2>

              <div className="form-group">
                <label htmlFor="role" className="input-label">Role</label>
                <select
                  id="role"
                  name="role"
                  className="input-field"
                  value={selectedRole}
                  onChange={handleRoleSelection}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Chef">Chef</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name" className="input-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="input-field"
                  required
                />
              </div>

              {selectedRole === "Chef" && (
                <div className="form-group">
                  <label htmlFor="location" className="input-label">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password" className="input-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" className="submit-button">Signup</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupComponent;
