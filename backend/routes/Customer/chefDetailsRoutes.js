const express = require('express');
const router = express.Router();
const chefDetailsOverCustomerController = require('../../controllers/Customer/chefDetailsOverCustomerController');
const {protect} = require('../../middleware/validate');

// Get chef details by ID
router.get('/:id', protect, chefDetailsOverCustomerController.getChefDetailsById);

// Get QR code image by chef ID
router.get('/:id/qrcode', protect, chefDetailsOverCustomerController.getChefQRCode);

module.exports = router;
