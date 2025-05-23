const express = require("express");
const { getAllUsers, toggleChefAvailability, verifyChef, toggleVerification} = require("../../controllers/Admin/adminTrackUserController");

const router = express.Router();

router.get("/", getAllUsers);
router.patch("/toggle-availability/:chefId", toggleChefAvailability);
router.patch("/verify-chef/:chefId", verifyChef);
router.patch("/toggle-verification/:chefId", toggleVerification);
module.exports = router;