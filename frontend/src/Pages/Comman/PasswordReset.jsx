import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    // Validate token when component mounts
    if (token) {
      try {
        // This is a simple check, but a real validation would happen on the server
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          setValidToken(false);
          setError("Invalid reset link");
        }
      } catch (error) {
        setValidToken(false);
        setError("Invalid reset link");
      }
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    
    if (password.length < 4) {
      setError("Password must be at least 4 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/comman/auth/reset-password", {
        token,
        password
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Invalid Reset Link</h3>
          <p className="text-gray-600 mb-4">The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="inline-block bg-orange-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-orange-700 transition duration-300">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
          <p className="text-gray-600 mb-4">Your password has been updated successfully.</p>
          <Link to="/login" className="inline-block bg-orange-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-orange-700 transition duration-300">
            Login with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Reset Your Password</h2>
        
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter new password"
              minLength="4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="Confirm new password"
              minLength="4"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded-full font-semibold hover:bg-orange-700 transition duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-orange-500 hover:text-orange-700 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;