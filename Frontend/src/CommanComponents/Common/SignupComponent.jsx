    // const handleSubmit = (e) => {
    //     e.preventDefault()
    //     axios.post("http://localhost:3001/register", { name, email, password })
    //     .then(result => {console.log(result)
    //     navigate("/login")
    //     })
    //     .catch(err => console.log(err))
    // }

import React, { useState } from "react";
import {Link} from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function SignupComponent() {
  const [selectedRole, setSelectedRole] = useState("");
  const [location, setLocation] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    if (role !== "Chef") setLocation("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, role: selectedRole, location: selectedRole === "Chef" ? location : undefined };
  
    try {
      const response = await fetch("http://localhost:8080/auth/signup", { // Use backend's full URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setErrorMessage("");
        if (data.role === "Customer") {
          navigate("/customer/");
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
    <div className="container">
      <h2>Signup</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleSubmit} method="POST">
        <div className="dropdown my-4">
          <button
            className="btn dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {selectedRole ? `Signup as: ${selectedRole}` : "Signup as:"}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item" type="button" onClick={() => handleRoleSelection("Chef")}>
                Chef
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => handleRoleSelection("Customer")}>
                Customer
              </button>
            </li>
          </ul>
        </div>
        {selectedRole === "Chef" && (
          <div className="form-group my-3">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              className="form-control"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              required
            />
          </div>
        )}
        <div className="form-group my-3">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="form-group my-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group my-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Signup
        </button>
      </form>
    </div>
  );
}

export default SignupComponent;
