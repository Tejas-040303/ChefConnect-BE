const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the schema for the user
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ["Chef", "Customer"], // Validate the role to only allow Chef or Customer
  },
  location: {
    type: String,
    trim: true,
    required: function () {
      return this.role === "Chef"; // Location is required only for Chefs
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
