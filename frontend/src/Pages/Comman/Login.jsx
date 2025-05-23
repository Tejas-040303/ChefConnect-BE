import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import veganImage from "../../assets/veganImage.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await axios.post("http://localhost:8080/comman/auth/login", {
        ...formData,
        role,
      });

      console.log("Login Response:", res.data); // ✅ Debugging

      if (res.data?.success === true) {
        localStorage.setItem("token", res.data.jwtToken);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // ✅ Navigate based on role
        navigate(res.data.user.role === "Chef" ? "/chef/" : "/customer/");
      } else {
        throw new Error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 sm:p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="hidden lg:block w-1/2">
          <img
            src={veganImage}
            alt="Vegan"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full lg:w-1/2 p-5 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-orange-600 mb-4 -mt-8">
            Login
          </h2>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-center mb-4 bg-green-50 p-2 rounded-lg">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500"
            >
              <option value="">Select Role</option>
              <option value="Chef">Chef</option>
              <option value="Customer">Customer</option>
            </select>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 rounded-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Additional Links */}
            <div className="text-center space-y-2 mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-orange-500 hover:text-orange-700 font-medium"
                >
                  Signup!
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link
                  to="/forgot-password"
                  className="text-orange-500 hover:text-orange-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </p>
            </div>
            <div className="text-center space-y-2 mt-4">
              <p className="text-sm text-gray-600">
                <Link
                  to="/admin-login"
                  className="text-orange-500 hover:text-orange-700 font-medium"
                >
                  Login as Admin!
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;