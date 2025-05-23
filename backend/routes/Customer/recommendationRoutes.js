const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/validate');
const { getRecommendedChefs } = require('../../controllers/Customer/recommendationController');

router.get('/recommended-chefs', authenticateUser, getRecommendedChefs);

module.exports = router;