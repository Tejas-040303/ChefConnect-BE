const express = require('express');
const router = express.Router();
const { 
  createOrFetchChat, 
  createGroupChat,
  getUserChats,
  getChatMessages,
  getGlobalChat
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/global', getGlobalChat);
router.post('/direct', createOrFetchChat);
router.post('/group', createGroupChat);
router.get('/', getUserChats);
router.get('/:chatId/messages', getChatMessages);

module.exports = router;