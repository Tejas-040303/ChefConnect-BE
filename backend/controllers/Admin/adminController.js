const Admin = require("../../models/Admin/AdminSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();


const SECRET_KEY = process.env.JWT_SECRET; // Use environment variables in production
const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY; // Set this in an environment variable

// Admin Signup
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, passkey } = req.body;

        // Check if passkey is correct
        if (passkey !== ADMIN_PASSKEY) {
            return res.status(400).json({ message: "Invalid passkey" });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Create new admin
        const newAdmin = new Admin({ name, email, password, passkey });
        await newAdmin.save();

        res.status(201).json({ success: true, message: "Admin registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ adminId: admin._id }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ success: true, jwtToken: token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};