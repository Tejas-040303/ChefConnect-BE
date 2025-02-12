const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/UserSchema');

router.use(authMiddleware);

// Get all friends
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add friend
router.post('/:friendId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.friends.includes(req.params.friendId)) {
      user.friends.push(req.params.friendId);
      await user.save();
    }
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove friend
router.delete('/:friendId', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: req.params.friendId }
    });
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;