const express = require('express');
const router = express.Router();
const { getChefDetails } = require('../controllers/chefDetailsController');

router.get('/:chefId', getChefDetails);
module.exports = router;