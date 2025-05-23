// models/Chef/ReviewSchema.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent multiple reviews for the same order
ReviewSchema.index({ order: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;