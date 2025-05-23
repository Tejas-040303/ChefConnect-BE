const express = require('express');
const router = express.Router();
const chefDetailsController = require("../../controllers/Customer/chefDetailsController");

router.get('/chefDetails', chefDetailsController.getChefsForDashboard);

module.exports = router;