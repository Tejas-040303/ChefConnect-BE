const express = require("express");
const { registerAdmin, loginAdmin } = require("../../controllers/Admin/adminController");
const authAdminMiddleware = require("../../middleware/authAdminMiddleware");

const router = express.Router();

// Admin Signup
router.post("/signup", registerAdmin);

// Admin Login
router.post("/login", loginAdmin);

// Protected Admin Route Example
router.get("/dashboard", authAdminMiddleware, (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard", admin: req.admin });
});

module.exports = router;

