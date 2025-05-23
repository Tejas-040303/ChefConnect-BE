const express = require("express");
const router = express.Router();
const chefTrainingRequestController = require("../../controllers/Admin/chefTrainingRequestController");
// const authAdminMiddleware = require("../../middleware/authAdminMiddleware");

// Get all training requests (admin only)
router.get("/", chefTrainingRequestController.getAllTrainingRequests);

// Get a specific training request by ID
router.get("/:id", chefTrainingRequestController.getTrainingRequestById);

// Update a training request (approve, reject, etc.)
router.put("/:id", chefTrainingRequestController.updateTrainingRequest);

// Delete a training request
router.delete("/:id", chefTrainingRequestController.deleteTrainingRequest);

module.exports = router;