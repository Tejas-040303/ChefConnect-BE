// controllers/Comman/authController.js
const User = require('../../models/Comman/UserSchema');
const Chef = require('../../models/Chef/ChefSchema');
const Customer = require('../../models/Customer/CustomerSchema');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();
// Create a transporter for sending emails - configure with your SMTP details
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    let newUser;
    if (role === 'Chef') {
      if (!location) {
        return res.status(400).json({ success: false, message: 'Location is required for Chef' });
      }
      newUser = new Chef({ name, email, password, role, location });
    } else if (role === 'Customer') {
      newUser = new Customer({ name, email, password, role });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await newUser.save();

    // Generate JWT token (adjust secret & expiration as needed)
    const token = jwt.sign({ _id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const redirectUrl = role === 'Chef' ? '/chef/profile' : '/customer/profile';

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      redirectUrl,
      jwtToken: token,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or role" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const redirectUrl = role === "Chef" ? "/chef/profile" : "/customer/profile";
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role },
      redirectUrl,
      jwtToken: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email with OTP and reset link
const sendPasswordResetEmail = async (email, otp, resetToken) => {
  // Create frontend reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #f97316;">Password Reset Request</h2>
        <p>We received a request to reset your password. Please use the following OTP to verify your identity:</p>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>Alternatively, you can click the button below to reset your password:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP and link will expire in 10 minutes for security reasons.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Find user by email (and role if provided)
    const query = { email };
    if (role) query.role = role;
    
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate OTP and resetToken
    const otp = generateOTP();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry to 10 minutes from now
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    
    // Hash the token for security before storing in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Update user with reset information
    user.resetPasswordToken = hashedToken;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Send email with OTP and reset link
    await sendPasswordResetEmail(user.email, otp, resetToken);
    
    res.status(200).json({ 
      success: true, 
      message: "Password reset email sent successfully"
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }
    
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }
    
    // OTP verified, generate a temporary token for password reset
    const tempToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      tempToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and new password are required" 
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
    
    // Find user by id
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = { 
  signup, 
  login, 
  getCurrentUser, 
  forgotPassword,
  verifyOTP,
  resetPassword
};