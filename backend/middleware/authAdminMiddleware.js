const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin/AdminSchema");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET; // Store securely

module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({ message: "Admin not found" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};