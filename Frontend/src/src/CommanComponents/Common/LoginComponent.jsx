import React, { useState } from "react";
import "../../../public/css/CommanCss/LoginComponent.css";

function LoginComponent() {
  const [selectedRole, setSelectedRole] = useState(""); // Track selected role
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = (e) => {
    setSelectedRole(e.target.value); // Update the selected role
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData, role: selectedRole };
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }
      if (data.success) {
        
        localStorage.setItem("token", data.jwtToken); // Store the token
        
        alert(data.message);
        // Redirect based on role
        const redirectPath =
          data.role === "Chef" ? "/chef/dashboard" : "/customer/";
        window.location.href = redirectPath;
      }
    } catch (err) {
      console.error(err.message);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <div className="login-container">
            {/* Centered Container */}
            <div className="login-content">
                {/* Left Section with Image */}
                <div className="image-section">
                    <img
                        src="../../public/Food1.png"
                        alt="Delicious Food"
                        className="side-image"
                    />
                </div>

                {/* Right Section with Form */}
                <div className="form-section">
                    <div className="login-form-inner">
                        <form onSubmit={handleLogin}>
                            <h2 className="form-title">Welcome Back</h2>
                            {errorMessage && <div className="error-message">{errorMessage}</div>}

                            {/* Role Selection Dropdown */}
                            <div className="role-selection input-group">
                                <label htmlFor="role" className="input-label">
                                    Select Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={selectedRole}
                                    onChange={handleRoleSelection}
                                    required
                                    className="input-field"
                                >
                                    <option value="" disabled>
                                        Select your role
                                    </option>
                                    <option value="Chef">Chef</option>
                                    <option value="Customer">Customer</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="email" className="input-label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="input-field"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="password" className="input-label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading || !selectedRole}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;
