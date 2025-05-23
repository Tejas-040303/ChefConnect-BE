import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("request"); // request, verify, reset

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8080/comman/auth/forgot-password", {
        email,
        role
      });

      if (response.data.success) {
        setMessage("Reset instructions sent to your email");
        setStep("verify");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Forgot Password</h2>
        
        {step === "request" && (
          <>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            {message && <div className="text-green-600 text-center mb-4">{message}</div>}
            
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Role</option>
                  <option value="Chef">Chef</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 rounded-full font-semibold hover:bg-orange-700 transition duration-300"
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-orange-500 hover:text-orange-700 text-sm">
                Back to Login
              </Link>
            </div>
          </>
        )}
        
        {step === "verify" && <VerifyOTP email={email} setStep={setStep} />}
        {step === "reset" && <ResetPassword email={email} />}
      </div>
    </div>
  );
};

const VerifyOTP = ({ email, setStep }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/comman/auth/verify-otp", {
        email,
        otp
      });

      if (response.data.success) {
        // Store the temporary token for the password reset
        localStorage.setItem("resetToken", response.data.tempToken);
        setStep("reset");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">Verify OTP</h3>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      
      <div className="mb-4 text-center text-gray-600">
        We've sent a verification code to <span className="font-medium">{email}</span>
      </div>
      
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 text-center tracking-widest"
            placeholder="000000"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded-full font-semibold hover:bg-orange-700 transition duration-300"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      
      <div className="text-center mt-4">
        <button 
          onClick={() => setStep("request")} 
          className="text-orange-500 hover:text-orange-700 text-sm"
        >
          Back to Email Entry
        </button>
      </div>
    </>
  );
};

const ResetPassword = ({ email }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("resetToken");
      if (!token) {
        throw new Error("Reset token not found");
      }

      const response = await axios.post("http://localhost:8080/comman/auth/reset-password", {
        token,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        localStorage.removeItem("resetToken");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
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
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">Set New Password</h3>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      
      <form onSubmit={handleResetPassword} className="space-y-4">
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
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </>
  );
};

export default ForgotPassword;