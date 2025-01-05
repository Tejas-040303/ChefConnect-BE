const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerProfileSchema = new Schema({
    img: {
        type: String, // Store image URL
        default: "",
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure no duplicate profiles
    },
    phone: {
        type: String,
        default: "", // Optional field
    },
    address: {
        type: String,
        default: "", // Optional field
    },
    preference: {
        type: String,
        enum: ["Vegan", "Vegetarian", "Non-Vegetarian"], // Example preferences
        default: "",
    },
}, { timestamps: true });

const CustomerProfile = mongoose.model("CustomerProfile", customerProfileSchema);
module.exports = CustomerProfile;
