const express = require("express");
const router = express.Router();
const chefTrainingController = require("../../controllers/Chef/chefTrainingController");
const { protect } = require("../../middleware/validate");

// Chef training routes
router.post('/request', protect, chefTrainingController.requestTraining);
router.get('/requests', protect, chefTrainingController.getChefTrainingRequests);
router.get('/available', protect, chefTrainingController.getAvailableTrainings);
router.put('/update/:requestId', protect, chefTrainingController.updateTrainingRequest);
router.delete('/cancel/:requestId', protect, chefTrainingController.cancelTrainingRequest);

module.exports = router;