// controllers/recommendationController.js

const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const customerId = req.user._id;
    const limit = parseInt(req.query.limit) || 3;
    
    const recommendations = await recommendationService.getChefRecommendations(customerId, limit);
    
    // Return just the array of recommended chefs, not wrapped in a data object
    // This matches what the frontend expects based on your code
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error in recommendation controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chef recommendations',
      error: error.message
    });
  }
};