const TrainingRequest = require('../../models/Chef/TrainingRequest');
const Chef = require('../../models/Chef/ChefSchema');
const asyncHandler = require('express-async-handler');

// @desc    Get all chef training requests
// @route   GET /admin/cheftraining
// @access  Private/Admin
const getAllTrainingRequests = asyncHandler(async (req, res) => {
  const trainingRequests = await TrainingRequest.find().sort({ createdAt: -1 });
  res.json(trainingRequests);
});

// @desc    Get a specific training request by ID
// @route   GET /admin/cheftraining/:id
// @access  Private/Admin
const getTrainingRequestById = asyncHandler(async (req, res) => {
  const trainingRequest = await TrainingRequest.findById(req.params.id);
  
  if (!trainingRequest) {
    res.status(404);
    throw new Error('Training request not found');
  }
  
  res.json(trainingRequest);
});

// @desc    Update a training request status, feedback, and scheduled date
// @route   PUT /admin/cheftraining/:id
// @access  Private/Admin
const updateTrainingRequest = asyncHandler(async (req, res) => {
    const trainingRequest = await TrainingRequest.findById(req.params.id);
    
    if (!trainingRequest) {
      res.status(404);
      throw new Error('Training request not found');
    }
    
    const { status, adminFeedback, scheduledDate, trainingInstructions } = req.body;
    
    const validStatuses = ['pending', 'approved', 'completed', 'rejected', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    
    if (status === 'approved' && !scheduledDate) {
      res.status(400);
      throw new Error('Scheduled date is required when approving a training request');
    }
    
    trainingRequest.status = status || trainingRequest.status;
    
    if (adminFeedback) {
      trainingRequest.adminFeedback = adminFeedback;
    }
    
    if (scheduledDate) {
      trainingRequest.scheduledDate = scheduledDate;
    }
    
    // Handle training instructions updates
    if (trainingInstructions && typeof trainingInstructions === 'object') {
      // Convert the instructions object to a Map if it's not already
      if (!trainingRequest.trainingInstructions) {
        trainingRequest.trainingInstructions = new Map();
      }
      
      // Update instructions for each provided training option
      Object.entries(trainingInstructions).forEach(([option, instruction]) => {
        if (trainingRequest.trainingOptions.includes(option)) {
          trainingRequest.trainingInstructions.set(option, instruction);
        }
      });
    }
    
    if (status === 'completed') {
      trainingRequest.completionDate = new Date();
    }
    
    const updatedTrainingRequest = await trainingRequest.save();
    res.json({ success: true, data: updatedTrainingRequest });
  });
  

// @desc    Delete a training request
// @route   DELETE /admin/cheftraining/:id
// @access  Private/Admin
const deleteTrainingRequest = asyncHandler(async (req, res) => {
  const trainingRequest = await TrainingRequest.findById(req.params.id);
  
  if (!trainingRequest) {
    res.status(404);
    throw new Error('Training request not found');
  }
  
  await trainingRequest.remove();
  
  res.json({
    success: true,
    message: 'Training request removed'
  });
});

module.exports = {
  getAllTrainingRequests,
  getTrainingRequestById,
  updateTrainingRequest,
  deleteTrainingRequest
};