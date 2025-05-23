// routes/chatRoute.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {protect} = require('../middleware/validate');

// routes/chatRoute.js - Add this route
router.get('/users', protect, chatController.getUsers);

// Global chat routes
router.post('/global/message', protect, chatController.sendGlobalMessage);
router.get('/global', protect, chatController.getGlobalMessages);

// Private chat routes
router.post('/private/message', protect, chatController.sendPrivateMessage);
router.get('/private/:userId', protect, chatController.getPrivateMessages);
router.get('/private-chats', protect, chatController.getUserPrivateChats);


module.exports = router;