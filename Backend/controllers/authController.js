const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const Chef = require("../models/ChefSchema");
const Customer = require("../models/CustomerSchema");

const signup = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "Chef") {
      user = new Chef({ name, email, password: hashedPassword, role, location });
    } else {
      user = new Customer({ name, email, password: hashedPassword, role });
    }
    await user.save();
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // controllers/authController.js (login endpoint)
    const token = jwt.sign({ user_id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, jwtToken: token, message: "Login successful as", role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signup, login };
