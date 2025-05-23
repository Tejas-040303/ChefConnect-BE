const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  getCurrentUser, 
  forgotPassword, 
  verifyOTP, 
  resetPassword 
} = require('../../controllers/Comman/authController');
const { validateSignUp, validateLogin, protect } = require('../../middleware/validate');

router.get('/me', protect, getCurrentUser);
router.post('/signup', validateSignUp, signup);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;