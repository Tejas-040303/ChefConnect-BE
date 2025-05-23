// controllers/chatController.js
const Chat = require('../models/Comman/chatSchema');
const User = require('../models/Comman/UserSchema');
const mongoose = require('mongoose');

// controllers/chatController.js - Add this controller function
exports.getUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all users except the current user
    const users = await User.find({ 
      _id: { $ne: userId },
      status: 'active'
    })
    .select('name role')
    .sort({ name: 1 });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Private chat controllers
// exports.sendPrivateMessage = async (req, res) => {
//   try {
//     const { recipientId, content } = req.body;
//     const senderId = req.user._id;
    
//     if (!content.trim()) {
//       return res.status(400).json({ message: 'Message content is required' });
//     }
    
//     // Find or create a chat between these two users
//     let chat = await Chat.findOne({
//       chatType: 'private',
//       users: { $all: [senderId, recipientId] }
//     });
    
//     if (!chat) {
//       chat = new Chat({
//         users: [senderId, recipientId],
//         messages: [],
//         chatType: 'private'
//       });
//     }
    
//     // Add the new message
//     chat.messages.push({
//       sender: senderId,
//       content,
//       timestamp: Date.now(),
//       read: false
//     });
    
//     chat.lastMessage = Date.now();
//     await chat.save();
    
//     // Emit to socket if recipient is online
//     const connections = global.connections;
//     const recipientSocket = connections.get(recipientId);
//     const senderSocket = connections.get(senderId);

//     const messageData = {
//       chatId: chat._id,
//       sender: senderId,
//       content,
//       timestamp: Date.now()
//     };

//     if (recipientSocket) {
//       recipientSocket.send(JSON.stringify({
//         type: 'NEW_PRIVATE_MESSAGE',
//         message: messageData
//       }));
//     }

//     if (senderSocket) {
//       senderSocket.send(JSON.stringify({
//         type: 'NEW_PRIVATE_MESSAGE',
//         message: messageData
//       }));
//     }
    
//     return res.status(201).json({ 
//       success: true, 
//       message: 'Message sent successfully',
//       chat
//     });
//   } catch (error) {
//     console.error('Send private message error:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.sendPrivateMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;
    
    if (!content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    let chat = await Chat.findOne({
      chatType: 'private',
      users: { $all: [senderId, recipientId] }
    });
    
    if (!chat) {
      chat = new Chat({
        users: [senderId, recipientId],
        messages: [],
        chatType: 'private'
      });
    }
    
    chat.messages.push({
      sender: senderId,
      content,
      timestamp: Date.now(),
      read: false
    });
    
    chat.lastMessage = Date.now();
    await chat.save();
    
    const connections = global.connections;
    const recipientSocket = connections.get(recipientId);
    const senderSocket = connections.get(senderId);
    
    // Get sender info to include in the message
    const sender = await User.findById(senderId).select('name role');
    
    const messageData = {
      chatId: chat._id,
      sender: {
        _id: sender._id,
        name: sender.name,
        role: sender.role
      },
      content,
      timestamp: Date.now(),
      recipient: recipientId // Add recipient info to ensure it's only sent to the right people
    };
    
    // Only send to the recipient and sender, nobody else
    if (recipientSocket) {
      recipientSocket.send(JSON.stringify({
        type: 'NEW_PRIVATE_MESSAGE',
        message: messageData
      }));
    }
    
    if (senderSocket) {
      senderSocket.send(JSON.stringify({
        type: 'NEW_PRIVATE_MESSAGE',
        message: messageData
      }));
    }
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chat
    });
  } catch (error) {
    console.error('Send private message error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// exports.getPrivateMessages = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { userId: recipientId } = req.params;
    
//     // Find chat between these two users
//     const chat = await Chat.findOne({
//       chatType: 'private',
//       users: { $all: [userId, recipientId] }
//     }).populate('messages.sender', 'name role');
    
//     if (!chat) {
//       return res.status(200).json({ messages: [] });
//     }
    
//     // Mark messages as read
//     if (chat.messages.length > 0) {
//       for (let i = 0; i < chat.messages.length; i++) {
//         if (chat.messages[i].sender.toString() !== userId.toString() && !chat.messages[i].read) {
//           chat.messages[i].read = true;
//         }
//       }
//       await chat.save();
//     }
    
//     return res.status(200).json({ 
//       chatId: chat._id,
//       messages: chat.messages 
//     });
//   } catch (error) {
//     console.error('Get private messages error:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: recipientId } = req.params;
    
    // Ensure both users are part of the chat to enforce privacy
    const chat = await Chat.findOne({
      chatType: 'private',
      users: { $all: [userId, recipientId] }
    }).populate('messages.sender', 'name role');
    
    if (!chat) {
      return res.status(200).json({ messages: [] });
    }
    
    // Mark messages as read only if current user is recipient
    if (chat.messages.length > 0) {
      for (let i = 0; i < chat.messages.length; i++) {
        // Convert to string for proper comparison
        const senderId = chat.messages[i].sender._id ? 
          chat.messages[i].sender._id.toString() : 
          chat.messages[i].sender.toString();
        
        if (senderId !== userId.toString() && !chat.messages[i].read) {
          chat.messages[i].read = true;
        }
      }
      await chat.save();
    }
    
    return res.status(200).json({
      chatId: chat._id,
      messages: chat.messages
    });
  } catch (error) {
    console.error('Get private messages error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// exports.getUserPrivateChats = async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Find all private chats for this user
//     const chats = await Chat.find({
//       chatType: 'private',
//       users: userId
//     })
//     .populate('users', 'name role')
//     .sort({ lastMessage: -1 });
    
//     // Format the response
//     const formattedChats = chats.map(chat => {
//       // Get the other user in each chat
//       const otherUser = chat.users.find(user => user._id.toString() !== userId.toString());
      
//       // Get the last message
//       const lastMessage = chat.messages.length > 0 
//         ? chat.messages[chat.messages.length - 1] 
//         : null;
      
//       // Count unread messages
//       const unreadCount = chat.messages.filter(
//         msg => msg.sender.toString() !== userId.toString() && !msg.read
//       ).length;
      
//       return {
//         chatId: chat._id,
//         user: otherUser,
//         lastMessage: lastMessage ? {
//           content: lastMessage.content,
//           timestamp: lastMessage.timestamp,
//           sender: lastMessage.sender
//         } : null,
//         unreadCount
//       };
//     });
    
//     return res.status(200).json(formattedChats);
//   } catch (error) {
//     console.error('Get user chats error:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.getUserPrivateChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Only get chats that include the current user
    const chats = await Chat.find({ 
      chatType: 'private',
      users: userId 
    }).populate('users', 'name role').sort({ lastMessage: -1 });
    
    const formattedChats = chats.map(chat => {
      // Get the other user in the conversation (not the current user)
      const otherUser = chat.users.find(user => 
        user._id.toString() !== userId.toString()
      );
      
      const lastMessage = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1] 
        : null;
        
      const unreadCount = chat.messages.filter(msg => 
        msg.sender.toString() !== userId.toString() && !msg.read
      ).length;
      
      return {
        chatId: chat._id,
        user: otherUser,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender
        } : null,
        unreadCount
      };
    });
    
    return res.status(200).json(formattedChats);
  } catch (error) {
    console.error('Get user chats error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Global chat controllers
exports.sendGlobalMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.user._id;
    
    if (!content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Get or create global chat
    const globalChat = await Chat.getGlobalChat();
    
    // Add the new message
    globalChat.messages.push({
      sender: senderId,
      content,
      timestamp: Date.now(),
      read: true // Global messages are considered read immediately
    });
    
    globalChat.lastMessage = Date.now();
    await globalChat.save();
    
    // Broadcast to all connected users
    const connections = global.connections;
    const sender = await User.findById(senderId).select('name role');
    
    connections.forEach((socket) => {
      socket.send(JSON.stringify({
        type: 'NEW_GLOBAL_MESSAGE',
        message: {
          id: globalChat.messages[globalChat.messages.length - 1]._id,
          sender: {
            _id: sender._id,
            name: sender.name,
            role: sender.role
          },
          content,
          timestamp: Date.now()
        }
      }));
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Global message sent successfully' 
    });
  } catch (error) {
    console.error('Send global message error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getGlobalMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    
    // Get global chat
    const globalChat = await Chat.getGlobalChat();
    
    // Get paginated messages
    const startIndex = Math.max(0, globalChat.messages.length - (page + 1) * limit);
    const endIndex = Math.max(0, globalChat.messages.length - page * limit);
    
    const paginatedMessages = globalChat.messages
      .slice(startIndex, endIndex)
      .reverse();
    
    // Populate sender info
    const messages = await Chat.populate(paginatedMessages, {
      path: 'sender',
      select: 'name role'
    });
    
    return res.status(200).json({
      chatId: globalChat._id,
      messages,
      hasMore: startIndex > 0
    });
  } catch (error) {
    console.error('Get global messages error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};