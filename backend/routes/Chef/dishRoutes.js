const express = require('express');
const router = express.Router();
const {protect} = require('../../middleware/validate'); // Assume auth middleware exists
const dishController = require('../../controllers/Chef/dishController');

router.get('/', protect, dishController.getDishes);
router.post('/', protect, dishController.addDish);

module.exports = router;