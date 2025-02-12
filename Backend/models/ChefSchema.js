// backend/models/ChefSchema.js
const User = require("./UserSchema");
const mongoose = require("mongoose");

const ChefSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "../../../../public/person.jpg",
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Phone number must be 10 digits",
      },
    },
    address: String,
    specialties: [
      {
        type: String,
        enum: ["Indian", "Mexican", "Italian", "Chinese", "Japanese", "Mediterranean", "French", "Thai", "Spanish"],
      },
    ],
    dishes: {
      veges: [
        {
          type: String,
          enum: ["Paneer", "Aloo", "Gobi", "Bhindi", "Palak", "Mushroom", "Kofta", "Chole"],
        },
      ],
      rotis: [
        {
          type: String,
          enum: ["Tandoori Roti", "Naan", "Rumali Roti", "Paratha", "Bhakri", "Kulcha", "Missi Roti", "Puri"],
        },
      ],
      rice: [
        {
          type: String,
          enum: ["Biryani", "Fried Rice", "Pulao", "Khichdi", "Curd Rice", "Jeera Rice", "Vegetable Rice", "Lemon Rice"],
        },
      ],
      fastFoods: [
        {
          type: String,
          enum: ["Pizza", "Burger", "Sandwich", "Fries", "Pasta", "Tacos", "Hot Dog", "Nachos"],
        },
      ],
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        isWorking: {
          type: Boolean,
          default: false,
        },
        slots: [
          {
            startTime: String,
            endTime: String,
            maxOrders: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Chef = User.discriminator("Chef", ChefSchema);
module.exports = Chef;
