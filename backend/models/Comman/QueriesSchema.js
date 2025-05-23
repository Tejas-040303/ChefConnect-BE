const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    role: {
      type: String,
      enum: ["Customer", "Chef", "Anonymous"],
      required: [true, "Role is required"],
      default: "Customer",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^\+?[\d\s-]{10,}$/,
        "Please enter a valid phone number (minimum 10 digits, optional + prefix)",
      ],
    },
    query: {
      type: String,
      required: [true, "Query is required"],
      trim: true,
      minlength: [1, "Query cannot be empty"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved", "In Progress"],
      default: "Pending",
    },
    adminResponse: {
      type: String,
      default: null,
    },
    lastEmailSent: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

querySchema.index({ createdAt: -1 });
querySchema.index({ email: 1 });

const Query = mongoose.model("Query", querySchema);
module.exports = Query;