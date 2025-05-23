import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import veganImage from "../../assets/veganImage.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({ role: "", name: "", email: "", password: "", location: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    // Check for password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isValidLength = password.length >= 8 && password.length <= 12;

    if (!isValidLength) {
      return "Password must be between 8 and 12 characters";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    
    return ""; // Empty string means no error
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate password as user types
    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    // Final password validation before submit
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return; // Stop form submission if password is invalid
    }
    
    try {
      const response = await fetch("http://localhost:8080/comman/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        // Assume API returns jwtToken
        localStorage.setItem("token", data.jwtToken);
        setSuccessMessage(data.message || "Signup successful!");
        setTimeout(() => {
          // Navigate to profile page for Chef after signup
          if (formData.role === "Chef") {
            navigate("/chef/chef-profile");
          } else if (formData.role === "Customer") {
            navigate("/customer/");
          } else {
            navigate("/login");
          }
        }, 2000);
      } else {
        setErrorMessage(data.error || "Signup failed. Try again.");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="signup-container flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="hidden lg:block flex-1">
          <img src={veganImage} alt="Vegan" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 w-full p-5 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-center text-orange-600 mb-2">Sign Up</h2>
          {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Role</option>
              <option value="Customer">Customer</option>
              <option value="Chef">Chef</option>
            </select>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500"
            />
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 rounded-lg border ${passwordError ? 'border-red-500' : 'border-orange-300'} focus:ring-2 focus:ring-orange-500`}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Password must be 8-12 characters with at least one uppercase letter, one lowercase letter, and one special character.
              </p>
            </div>
            {formData.role === "Chef" && (
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500"
              />
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white py-2 rounded-full font-semibold shadow-md hover:from-orange-700 hover:to-yellow-600 transition-all"
              disabled={!!passwordError && formData.password.length > 0}
            >
              Sign Up
            </button>
          </form>
          <p className="text-center text-gray-600 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-600 font-medium hover:text-orange-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;