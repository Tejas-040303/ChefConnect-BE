const jwt = require("jsonwebtoken");
const Customer = require("../models/CustomerSchema");
const Chef = require("../models/ChefSchema");
const User = require("../models/UserSchema"); 

exports.customerprofile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const { password, __v, ...profile } = customer.toObject();

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updateData = { ...req.body }; // Now contains parsed form fields

    // Handle uploaded image
    if (req.file) {
      updateData.img = `/uploads/${req.file.filename}`; // Adjust path as needed
    }

    // Prevent email/password changes
    delete updateData.email;
    delete updateData.password;

    // Update customer document
    const updatedCustomer = await Customer.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true } // Ensure validators run
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { password, __v, ...profile } = updatedCustomer.toObject();
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      error: error.errors 
    });
  }
};

exports.chefProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const chef = await Chef.findById(userId)
      .select("-password -__v")
      .lean();

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef not found"
      });
    }

    // Handle missing schedule field
    const { schedule = [] } = chef;
    
    // Create full week schedule structure
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const fullSchedule = daysOfWeek.map(day => {
      const existingDay = schedule.find(d => d.day === day);
      return existingDay || {
        day,
        isWorking: false,
        slots: []
      };
    });

    res.json({
      success: true,
      profile: {
        ...chef,
        schedule: fullSchedule
      }
    });
  } catch (error) {
    console.error('Chef profile error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching chef profile",
      error: error.message
    });
  }
};

exports.updateChefProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const parseField = (fieldName) => {
      if (updateData[fieldName]) {
        try {
          updateData[fieldName] = JSON.parse(updateData[fieldName]);
          // Ensure dish categories have proper array structure
          if (fieldName === 'dishes') {
            const dishCategories = ['veges', 'rotis', 'rice', 'fastFoods'];
            dishCategories.forEach(cat => {
              if (!Array.isArray(updateData[fieldName][cat])) {
                updateData[fieldName][cat] = [];
              }
            });
          }
        } catch (error) {
          throw new Error(`Invalid ${fieldName} format: ${error.message}`);
        }
      }
    };
    

    ['specialties', 'dishes', 'schedule'].forEach(field => parseField(field));

    if (!updateData.name || !updateData.location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required fields"
      });
    }

    const updatedChef = await Chef.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedChef) {
      return res.status(404).json({
        success: false,
        message: "Chef not found"
      });
    }

    res.json({
      success: true,
      profile: updatedChef
    });

  } catch (error) {
    console.error('Update chef error:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Error updating chef profile",
      ...(error.errors && { errors: error.errors })
    });
  }
};