const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/validate');
const customerSettingsController = require('../../controllers/Customer/customerSettingsController');

// Change Password
router.patch('/password', protect, customerSettingsController.changePassword);

// Request Account Deletion
router.post('/delete-request', protect, customerSettingsController.requestAccountDeletion);

// Submit Complaint
router.post('/complaint', protect, customerSettingsController.submitComplaint);

// Contact Admin
router.post('/contact-admin', protect, customerSettingsController.contactAdmin);

module.exports = router;