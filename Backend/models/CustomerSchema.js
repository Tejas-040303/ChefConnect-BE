// CustomerSchema.js
const User = require("./UserSchema");
const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    img: {
      type: String, // Store image URL
      default: "",
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 10,
    },
    address: {
      type: String,
    },
    preference: {
      type: String,
      enum: ["", "Vegan", "Vegetarian", "Non-Vegetarian"],
    },
    // You can add extra customer-specific fields here if needed.
    // We will be using it for customerProfile
  },
  { timestamps: true }
);

// Create the Customer model as a discriminator of User
const Customer = User.discriminator("Customer", CustomerSchema);
module.exports = Customer;