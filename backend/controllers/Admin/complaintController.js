const Complaint = require('../../models/Admin/Complaint');
const Message = require('../../models/Admin/Message');
const User = require('../../models/Comman/UserSchema');
const { sendComplaintStatusEmail } = require('../../services/emailService');
const { generateComplaintStatusEmail, sendEmail } = require('../../utils/emailTemplateComplaints');

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email role');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    console.log('Updated complaint:', complaint);
    
    if ((status === 'Resolved' || status === 'In Progress') && complaint.user && complaint.user.email) {
      try {
        const statusMessage = status === 'Resolved' 
          ? `We're pleased to inform you that your complaint has been resolved. Thank you for your patience.`
          : `We're currently working on your complaint. Our team is actively addressing the issues you've raised.`;
        
        const htmlContent = generateComplaintStatusEmail(complaint, statusMessage);
        
        sendEmail({
          email: complaint.user.email,
          subject: `Your complaint has been ${status === 'Resolved' ? 'resolved' : 'updated'}`,
          message: htmlContent
        }).catch(emailErr => {
          console.error('Email notification failed but status updated:', emailErr.message);
        });
        
        console.log('Email notification triggered');
      } catch (emailErr) {
        console.error('Failed to prepare email notification:', emailErr.message);
      }
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ 
      message: 'Server error while updating complaint status', 
      error: error.message 
    });
  }
};

exports.sendComplaintEmail = async (req, res) => {
  try {
    const { emailContent } = req.body;
    
    if (!emailContent || emailContent.trim() === '') {
      return res.status(400).json({ message: 'Email content is required' });
    }
    
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (!complaint.user.email) {
      return res.status(400).json({ message: 'User email not available' });
    }
    
    const htmlContent = generateComplaintStatusEmail(complaint, emailContent);
    await sendComplaintStatusEmail(
      complaint.user.email,
      `Update on your complaint #${complaint._id.toString().slice(-6)}`,
      htmlContent
    );
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('user', 'name email role');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Message.findById(req.params.id).populate('user', 'name email');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.user.email) {
      await sendEmail({
        email: message.user.email,
        subject: 'Response to your message',
        message: `Admin response: ${reply}\n\nYour original message: ${message.message}`
      });

    }
    
    message.replied = true;
    message.replyMessage = reply;
    message.isReply = true;
    message.isRead = true;
    await message.save();
    
    res.status(200).json({ message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};