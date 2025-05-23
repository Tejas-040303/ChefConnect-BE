const User = require('../Comman/UserSchema');
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    img: { 
      type: String, 
      default: '', 
      trim: true 
    },
    phone: { 
      type: String, 
      minlength: 10, 
      maxlength: 10, 
      validate: { 
        validator: (v) => /^\d{10}$/.test(v), 
        message: 'Phone number must be 10 digits' 
      } 
    },
    address: { 
      type: String, 
      trim: true 
    },
    preference: { 
      type: String, 
      enum: ['None', 'Vegan', 'Vegetarian', 'Non-Vegetarian'], 
      default: 'None' 
    },
    specialtiesPreferences: [{ 
      type: String, 
      enum: ['Indian', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Mediterranean', 'French', 'Thai', 'Spanish'] 
    }],
    orderHistory: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order' 
    }],
    favorites: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' // References chefs
    }],
    allergies: [{ 
      type: String, 
      trim: true 
    }],
    dietaryRestrictions: [{ 
      type: String, 
      trim: true 
    }],
    notificationPreferences: { 
      type: String, 
      enum: ['Email', 'SMS', 'Push', 'None'], 
      default: 'Push'
    },
    loyaltyPoints: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    deliveryInstructions: { 
      type: String, 
      maxlength: 200, 
      trim: true 
    }
  },
  { timestamps: true }
);

const Customer = User.discriminator('Customer', CustomerSchema);
module.exports = Customer;