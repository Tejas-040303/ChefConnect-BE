const UserModel = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!role || (role !== "Chef" && role !== "Customer")) {
      return res.status(400).json({ message: "Invalid role", success: false });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    if (role === "Chef" && !location) {
      return res.status(400).json({ message: "Location is required for Chef role", success: false });
    }

    const newUser = new UserModel({ name, email, password, role, location });
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      success: true,
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserModel.findOne({ email });
    const errorMsg = "Auth failed: email or password is wrong";

    // Check if the user exists
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    // Compare the provided password with the hashed password
    const isPassEqual = await bcrypt.compare(password, user.password);

    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id, role: user.role }, // Include role in the token
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successfully",
      success: true,
      jwtToken,
      email,
      name: user.name,
      role: user.role, // Include role in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
};
