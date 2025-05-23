// routes/customerProfileRoutes.js
const express = require('express');
const router = express.Router();
const {protect} = require('../../middleware/validate');
const customerProfileController = require('../../controllers/Customer/customerProfileController');
const upload = require('../../middleware/upload');

router.get('/me', protect, customerProfileController.getCustomerProfile);
router.patch('/me', protect, customerProfileController.updateCustomerProfile);
router.post('/upload-profile-image', protect, upload.single('image'), customerProfileController.uploadProfileImage);
router.delete('/profile-image', protect, customerProfileController.removeProfileImage);
module.exports = router;
