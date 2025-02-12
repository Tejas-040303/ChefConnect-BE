// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { 
  customerprofile, 
  updateProfile, 
  chefProfile, 
  updateChefProfile 
} = require("../controllers/profileController");

// Customer routes
router.post("/customerprofile", authMiddleware, customerprofile);
router.put("/customerprofileupdate", authMiddleware, upload.single('profileImage'), updateProfile);

// Chef routes
router.post("/chefprofile", authMiddleware, chefProfile);
router.patch("/chefprofileupdate", authMiddleware, upload.single('profileImage'), updateChefProfile);

module.exports = router;