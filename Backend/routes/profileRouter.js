const express = require("express");
const router = express.Router();
const CustomerProfile = require("../models/CustomerProfile"); // Update path if needed

// Get customer profile by ID
router.get("/:id", async (req, res) => {
    try {
        const profile = await CustomerProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update customer profile by ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const profile = await CustomerProfile.findByIdAndUpdate(id, updates, { new: true });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json({ message: "Profile updated", profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
