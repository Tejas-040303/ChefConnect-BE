const TrainingRequest = require('../../models/Chef/TrainingRequest');
const Chef = require('../../models/Chef/ChefSchema');
const { validationResult } = require('express-validator');

// Controller for chef training-related operations
const chefTrainingController = {
  /**
   * Request a new training session
   * @route POST /api/chef/training/request
   * @access Private (Chef only)
   */
  requestTraining: async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { 
        trainingOptions, 
        preferredTimeSlot, 
        additionalNotes 
      } = req.body;

      // Create new training request
      const newTrainingRequest = new TrainingRequest({
        chef: req.user._id,
        chefName: req.user.name,
        chefEmail: req.user.email,
        trainingOptions,
        preferredTimeSlot,
        additionalNotes,
        status: 'pending'
      });

      // Save the request
      const savedRequest = await newTrainingRequest.save();

      res.status(201).json({
        success: true,
        message: 'Training request submitted successfully',
        data: savedRequest
      });
    } catch (error) {
      console.error('Error in requestTraining:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit training request',
        error: error.message
      });
    }
  },

  /**
   * Get all training requests for the logged-in chef
   * @route GET /api/chef/training/requests
   * @access Private (Chef only)
   */
  getChefTrainingRequests: async (req, res) => {
    try {
      const trainingRequests = await TrainingRequest.find({ chef: req.user._id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: trainingRequests.length,
        data: trainingRequests
      });
    } catch (error) {
      console.error('Error in getChefTrainingRequests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch training requests',
        error: error.message
      });
    }
  },

  /**
   * Get available training options for chefs
   * @route GET /api/chef/training/available
   * @access Private (Chef only)
   */
  getAvailableTrainings: async (req, res) => {
    try {
      // This could be pulled from a database in a real implementation
      const availableTrainings = [
        "Advanced Continental Cuisine",
        "Food Hygiene and Safety",
        "Plating and Presentation",
        "Customer Service Training",
        "Online Order Management"
      ];

      res.status(200).json({
        success: true,
        data: availableTrainings
      });
    } catch (error) {
      console.error('Error in getAvailableTrainings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available trainings',
        error: error.message
      });
    }
  },

  /**
   * Update a training request
   * @route PUT /api/chef/training/update/:requestId
   * @access Private (Chef only)
   */
  updateTrainingRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { trainingOptions, preferredTimeSlot, additionalNotes } = req.body;

      // Find and update the training request
      const trainingRequest = await TrainingRequest.findById(requestId);

      if (!trainingRequest) {
        return res.status(404).json({
          success: false,
          message: 'Training request not found'
        });
      }

      // Check if this request belongs to the logged-in chef
      if (trainingRequest.chef.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this request'
        });
      }

      // Only allow updating if status is pending
      if (trainingRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot update request with status: ${trainingRequest.status}`
        });
      }

      // Update fields
      trainingRequest.trainingOptions = trainingOptions || trainingRequest.trainingOptions;
      trainingRequest.preferredTimeSlot = preferredTimeSlot || trainingRequest.preferredTimeSlot;
      trainingRequest.additionalNotes = additionalNotes || trainingRequest.additionalNotes;
      trainingRequest.updatedAt = Date.now();

      const updatedRequest = await trainingRequest.save();

      res.status(200).json({
        success: true,
        message: 'Training request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error in updateTrainingRequest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update training request',
        error: error.message
      });
    }
  },

  /**
   * Cancel a training request
   * @route DELETE /api/chef/training/cancel/:requestId
   * @access Private (Chef only)
   */
  cancelTrainingRequest: async (req, res) => {
    try {
      const { requestId } = req.params;

      // Find the training request
      const trainingRequest = await TrainingRequest.findById(requestId);

      if (!trainingRequest) {
        return res.status(404).json({
          success: false,
          message: 'Training request not found'
        });
      }

      // Check if this request belongs to the logged-in chef
      if (trainingRequest.chef.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this request'
        });
      }

      // Only allow cancellation if status is pending
      if (trainingRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel request with status: ${trainingRequest.status}`
        });
      }

      // Update status to cancelled
      trainingRequest.status = 'cancelled';
      trainingRequest.updatedAt = Date.now();

      const updatedRequest = await trainingRequest.save();

      res.status(200).json({
        success: true,
        message: 'Training request cancelled successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error in cancelTrainingRequest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel training request',
        error: error.message
      });
    }
  }
};

module.exports = chefTrainingController;