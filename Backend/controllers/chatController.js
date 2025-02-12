const Chat = require('../models/ChatSchema');
const Message = require('../models/MessageSchema');
const User = require('../models/UserSchema');

// Create or fetch one-on-one chat
// Add this new controller function
const getGlobalChat = async (req, res) => {
  try {
    const globalChat = await Chat.findOne({ type: 'global' })
      .populate('latestMessage')
      .populate('participants', '-password');
      
    if (!globalChat) return res.status(404).json({ message: 'Global chat not found' });
    
    res.json(globalChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update createOrFetchChat to handle type
const createOrFetchChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID not provided' });

    const existingChat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', '-password');

    if (existingChat) return res.json(existingChat);

    const newChat = await Chat.create({
      type: 'direct',
      participants: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id).populate('participants', '-password');
    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { participants, groupName } = req.body;
    if (!participants || !groupName) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(400).json({ message: 'One or more users not found' });
    }

    const groupChat = await Chat.create({
      isGroup: true,
      groupName,
      groupAdmin: req.user._id,
      participants: [...participants, req.user._id]
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const populated = await User.populate(chat, {
          path: 'latestMessage.sender',
          select: 'name email role'
        });
        return populated;
      })
    );

    res.json(populatedChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email role')
      .populate('chat')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getGlobalChat,
  createOrFetchChat,
  createGroupChat,
  getUserChats,
  getChatMessages
};