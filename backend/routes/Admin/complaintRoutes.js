const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllMessages,
  getMessageById,
  replyToMessage,
  sendComplaintEmail
} = require('../../controllers/Admin/complaintController');

router.get('/complaints', getAllComplaints);
router.get('/messages', getAllMessages);
router.get('/:id', getComplaintById);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/email', sendComplaintEmail);
router.get('/messages/:id', getMessageById);
router.post('/messages/:id/reply', replyToMessage);

module.exports = router;