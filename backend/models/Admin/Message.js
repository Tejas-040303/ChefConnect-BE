const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: {type: String, enum: ['Pending', 'View'], default: 'Pending' },
  isRead: { type: Boolean, default: false },
  isReply: { type: Boolean, default: false },
  replyMessage: { type: String},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);