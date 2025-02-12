// UserSchema.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      minlength: 3,
      maxlength: 100 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true, 
      minlength: 4 
    },
    role: { 
      type: String, 
      enum: ['Chef', 'Customer'], 
      required: true 
    },
    // Only required if the user is a Chef
    location: { 
      type: String, 
      required: function () { 
        return this.role === 'Chef'; 
      } 
    },
  },
  { 
    timestamps: true,
    discriminatorKey: 'role' // This key will hold the discriminator value (Chef or Customer)
  }
);

module.exports = mongoose.model('User', UserSchema);