const Dish = require('../../models/Chef/DishSchema');

// Fetch all dishes for the authenticated chef
exports.getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ chef: req.user._id });
    res.status(200).json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new dish
exports.addDish = async (req, res) => {
  try {
    const { name, description, price, ingredients, category, subCategory } = req.body;
    const dish = new Dish({
      name,
      description,
      price,
      ingredients,
      category,
      subCategory,
      chef: req.user._id,
    });
    await dish.save();
    res.status(201).json({ message: 'Dish added successfully', dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};