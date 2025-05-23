// backend/routes/chefProfileRoutes.js
const express = require('express');
const router = express.Router();
const { createOrUpdateChefProfile } = require('../../controllers/Chef/chefProfileController');
const {protect} = require('../../middleware/validate');
const Chef = require('../../models/Chef/ChefSchema');
const upload = require('../../middleware/upload');

router.post('/profile', protect, upload.single('profileImage'), createOrUpdateChefProfile);
router.get('/profile', protect, async (req, res) => {
    try {
      const chef = await Chef.findById(req.user._id).populate('dishes');
      if (!chef) {
        return res.status(404).json({ message: 'Chef profile not found' });
      }
      res.json({ chef });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
module.exports = router;
