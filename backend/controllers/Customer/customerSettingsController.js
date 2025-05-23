// backend/controllers/Customer/customerSettingsController.js
const User = require('../../models/Comman/UserSchema');
const Complaint = require('../../models/Admin/Complaint');
const Message = require('../../models/Admin/Message');

// Change Password
exports.changePassword = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Request Account Deletion
exports.requestAccountDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.status = 'deleted';
    await user.save();
    res.json({ message: 'Account deletion request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Submit Complaint
exports.submitComplaint = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Contact Admin
exports.contactAdmin = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
