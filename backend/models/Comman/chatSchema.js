const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

// For private chats
const chatSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  chatType: {
    type: String,
    enum: ['private', 'global'],
    default: 'private'
  }
}, { timestamps: true });

chatSchema.index({ users: 1 });
chatSchema.index({ lastMessage: -1 });
chatSchema.index({ chatType: 1 });

// Create a singleton global chat if it doesn't exist
chatSchema.statics.getGlobalChat = async function() {
  let globalChat = await this.findOne({ chatType: 'global' });
  if (!globalChat) {
    globalChat = await this.create({ 
      chatType: 'global', 
      users: [] // Global chat initially has no users assigned
    });
  }
  return globalChat;
};

module.exports = mongoose.model('Chat', chatSchema);