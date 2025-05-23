// backend/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const {protect} = require('../../middleware/validate');
const User = require('../../models/Comman/UserSchema');
const Complaint = require('../../models/Admin/Complaint');
const Message = require('../../models/Admin/Message');

// Change Password
router.patch('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

// Request Account Deletion
router.post('/delete-request', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.status = 'deleted'; // Mark as deleted (or implement admin approval logic)
  await user.save();
  res.json({ message: 'Account deletion request submitted' });
});

// Submit Complaint
router.post('/complaint', protect, async (req, res) => {
  const { complaint } = req.body;
  if (!complaint) {
    return res.status(400).json({ message: 'Complaint is required' });
  }
  const newComplaint = new Complaint({
    user: req.user._id,
    complaint,
  });
  await newComplaint.save();
  res.json({ message: 'Complaint submitted successfully' });
});

// Contact Admin
router.post('/contact-admin', protect, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  const newMessage = new Message({
    user: req.user._id,
    message,
  });
  await newMessage.save();
  res.json({ message: 'Message sent to admin' });
});

module.exports = router;