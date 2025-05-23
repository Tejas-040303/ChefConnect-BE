const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dishes: [{
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
  }],
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },
  diet: {
    type: String,
    enum: ["None", "Vegan", "Vegetarian", "Non-Vegetarian"],
    default: "None",
  },
  allergies: [{
    type: String,
    trim: true
  }],
  selectedDate: {
    type: Date,
    required: true
  },
  selectedTimeSlot: {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: true
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: true
    },
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Rejected", "Completed", "Expired"],
    default: "Pending",
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "QR Code", "UPI"],
    required: true,
  },
  expiredEmailSent: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", 'Awaiting Verification', "Failed", "Refunded"],
    default: "Pending",
  },
  timerExpiry: {
    type: Date
  },
}, {
  timestamps: true
});

OrderSchema.index({ customer: 1, chef: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ selectedDate: 1, "selectedTimeSlot.startTime": 1 });

module.exports = mongoose.model("Order", OrderSchema);