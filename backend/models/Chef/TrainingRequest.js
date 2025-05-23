
const mongoose = require('mongoose');
const TrainingRequestSchema = new mongoose.Schema({
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  chefName: {
    type: String,
    required: true
  },
  chefEmail: {
    type: String,
    required: true
  },
  trainingOptions: {
    type: [String],
    required: true,
    enum: ["Advanced Continental Cuisine", "Food Hygiene and Safety", "Plating and Presentation", "Customer Service Training", "Online Order Management"]
  },
  preferredTimeSlot: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  adminFeedback: {
    type: String,
    trim: true
  },
  // Added trainingInstructions as an object to store instructions per training option
  trainingInstructions: {
    type: Map,
    of: String,
    default: {}
  },
  scheduledDate: {
    type: Date
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrainingRequest', TrainingRequestSchema);