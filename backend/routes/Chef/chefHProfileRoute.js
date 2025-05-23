const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/validate');
const { displayOrUpdateChefProfile } = require('../../controllers/Chef/chefProfileController');
const upload = require('../../middleware/upload');

// Use fields() instead of single() to handle multiple file uploads
router.get('/me', protect, displayOrUpdateChefProfile);
router.patch('/me', protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'qrCodeImage', maxCount: 1 }
]), displayOrUpdateChefProfile);

module.exports = router;