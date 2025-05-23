const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Veges', 'Rotis', 'Rice', 'FastFoods', 'Desserts', 'Beverages'],
    required: true
  },
  subCategory: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        const subCategories = {
          Veges: ["Paneer", "Aloo", "Gobi", "Bhindi", "Palak", "Mushroom", "Kofta", "Chole"],
          Rotis: ["Tandoori Roti", "Naan", "Rumali Roti", "Paratha", "Bhakri", "Kulcha", "Missi Roti", "Puri"],
          Rice: ["Biryani", "Fried Rice", "Pulao", "Khichdi", "Curd Rice", "Jeera Rice", "Vegetable Rice", "Lemon Rice"],
          FastFoods: ["Pizza", "Burger", "Sandwich", "Fries", "Pasta", "Tacos", "Hot Dog", "Nachos"],
          Desserts: ["Ice Cream", "Cake", "Pastry", "Pudding"],
          Beverages: ["Tea", "Coffee", "Juice", "Smoothie"]
        };
        
        // Simpler validation that doesn't depend on document state
        return this.category && 
               subCategories[this.category] && 
               subCategories[this.category].includes(value);
      },
      message: 'Invalid sub-category for the selected category'
    }
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dish', DishSchema);