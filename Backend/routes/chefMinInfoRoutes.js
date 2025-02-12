const express = require('express');
const router = express.Router();
const { getChefsForDashboard } = require('../controllers/chefForCustomerController.js');

// GET all chefs for customer dashboard
router.get('/dashboard/chefDetails', getChefsForDashboard);

module.exports = router;