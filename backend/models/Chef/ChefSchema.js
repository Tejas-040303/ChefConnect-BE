const User = require('../Comman/UserSchema');
const mongoose = require('mongoose');

const ChefSchema = new mongoose.Schema(
  {
    profileImage: { 
      type: String, 
      default: '../../../../public/person.jpg', 
      trim: true 
    },
    phone: { 
      type: String,
      validate: { 
        validator: (v) => /^\d{10}$/.test(v), 
        message: 'Phone number must be 10 digits' 
      } 
    },
    address: { 
      type: String, 
      trim: true 
    },
    specialties: [{ 
      type: String, 
      enum: ['Indian', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Mediterranean', 'French', 'Thai', 'Spanish'] 
    }],
    dishes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Dish' 
    }],
    schedule: [{
      day: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
        required: true 
      },
      isWorking: { 
        type: Boolean, 
        default: false 
      },
      slots: [{
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
        maxOrders: { 
          type: Number, 
          min: 0 
        }
      }]
    }],
    experience: { 
      type: Number,
      min: 0 
    },
    bio: { 
      type: String, 
      maxlength: 500,
      trim: true 
    },
    isAvailable: { 
      type: Boolean, 
      default: false 
    },
    deliveryRadius: { 
      type: Number, 
      min: 0 
    },
    minimumOrder: { 
      type: String, 
      min: "0" 
    },
    paymentMethods: [{ 
      type: String, 
      enum: ['Cash','QR Code', 'UPI'] 
    }],
    averageRating: { 
      type: Number, 
      min: 0, 
      max: 5 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    qrCodeImage: { 
      type: String, 
      trim: true 
    },
    upiId: { 
      type: String, 
      trim: true 
    },
    paymentPhoneNumber: { 
      type: String,
      validate: { 
        validator: (v) => /^\d{10}$/.test(v), 
        message: 'Payment phone number must be 10 digits' 
      } 
    }

  },
  { timestamps: true }
);


// Index specialties for faster querying
ChefSchema.index({ specialties: 1 });

const Chef = User.discriminator('Chef', ChefSchema);
module.exports = Chef;