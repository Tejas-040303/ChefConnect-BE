const express = require('express');
const router = express.Router();
const { submitReview, getChefReviews } = require('../../controllers/Customer/reviewController');
const { protect } = require('../../middleware/validate');

// Submit a review
router.post('/', protect, submitReview);

// Get chef's reviews
router.get('/chef/:chefId', getChefReviews);

module.exports = router;