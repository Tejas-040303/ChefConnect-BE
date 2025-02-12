// backend/models/TeamSchema.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  description: String,
  specialties: [String],
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef'
  }],
  pricing: {
    hourly: Number,
    perEvent: Number
  },
  availability: [{
    date: Date,
    slots: [String] // ['10:00-12:00', '14:00-16:00']
  }]
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);