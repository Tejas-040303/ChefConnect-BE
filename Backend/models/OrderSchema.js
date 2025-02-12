const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  dishes: [{
    name: String,
    price: Number
  }],
  numberOfPeople: Number,
  selectedDay: String,
  selectedHours: Number,
  totalBill: Number,
  status: {
    type: String,
    enum: ['Pending', 'Cancelled', 'Confirmed', 'Completed'],
    default: 'Pending'
  },
  timerExpiry: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
