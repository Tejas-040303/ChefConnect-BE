import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const AdminSignup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        passkey: "", // One-time passkey required
    });
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
            const res = await axios.post("http://localhost:8080/admin/signup", formData);

            if (res.data.success) {
                alert("Admin registered successfully! Please login.");
                navigate("/admin/"); // Redirect to login page
            } else {
                throw new Error(res.data.message || "Signup failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
            {/* <div className="flex flex-col lg:flex-row items-center max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden"> */}
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
                        Admin Signup
                    </h2>
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500"
                        />

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

                        <input
                            type="text"
                            name="passkey"
                            placeholder="One-Time Passkey"
                            value={formData.passkey}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500"
                        />

                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white py-2 rounded-full font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing up..." : "Signup"}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center space-y-2 mt-4">
                            <p className="text-sm text-gray-600">
                                Already an admin?{" "}
                                <Link
                                    to="/admin-login"
                                    className="text-orange-500 hover:text-orange-700 font-medium"
                                >
                                    Login here!
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        // </div>

    );
};

export default AdminSignup;
