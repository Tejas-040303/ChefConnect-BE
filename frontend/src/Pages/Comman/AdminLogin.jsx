import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:8080/admin/login", formData);

            console.log("Admin Login Response:", res.data);

            if (res.data?.success) {
                localStorage.setItem("adminToken", res.data.jwtToken);
                navigate("/admin/"); // Redirect to Admin Dashboard
            } else {
                throw new Error(res.data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error("Admin Login Error:", err);
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
                    Admin Login
                </h2>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* Back to Login Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="w-full bg-gray-300 text-black py-2 rounded-full font-semibold mt-2"
                    >
                        Back to User Login
                    </button>
                    <div className="text-center space-y-2 mt-4">
                        <p className="text-sm text-gray-600">
                            <Link
                                to="/admin-signup"
                                className="text-orange-500 hover:text-orange-700 font-medium"
                            >
                                Signup as Admin!
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
