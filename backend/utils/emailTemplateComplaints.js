const generateComplaintStatusEmail = (complaint, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Complaint Status Update</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f4f4f4;
          padding: 15px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #fff;
          border: 1px solid #ddd;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .status-pending {
          background-color: #FFF3CD;
          color: #856404;
        }
        .status-progress {
          background-color: #CCE5FF;
          color: #004085;
        }
        .status-resolved {
          background-color: #D4EDDA;
          color: #155724;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Complaint Status Update</h2>
      </div>
      <div class="content">
        <p>Dear ${complaint.user.name},</p>
        
        <div class="status-badge ${
          complaint.status === 'Pending' ? 'status-pending' : 
          complaint.status === 'In Progress' ? 'status-progress' : 
          'status-resolved'
        }">
          Status: ${complaint.status}
        </div>
        
        <p>${content}</p>
        
        <p>Your complaint reference: <strong>#${complaint._id.toString().slice(-6)}</strong></p>
        <p>Original complaint: "${complaint.complaint.substring(0, 100)}${complaint.complaint.length > 100 ? '...' : ''}"</p>
        
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>ChefConnect Support Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply directly to this email.</p>
        <p>© ${new Date().getFullYear()} ChefConnect. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Send email utility function
 * A more robust implementation with proper error handling and fallback options
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient's email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message content (HTML format)
 * @returns {Promise<Object|null>} Information about the sent email or null if sending fails
 */
const sendEmail = async ({ email, subject, message }) => {
  // Validate required fields
  if (!email || !subject || !message) {
    console.error('Email sending failed: Missing required fields');
    return null;
  }

  try {
    // Create transporter object using SMTP
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      secure: true,
      // Add timeout to prevent hanging
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });

    // Setup email options
    const mailOptions = {
      from: `"ChefConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message, // HTML content
      text: message.replace(/<[^>]*>?/gm, ''), // Plain text fallback
    };

    // Verify transporter configuration before sending
    await transporter.verify();
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email, 'Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Return null instead of throwing error to prevent API call failure
    return null;
  }
};

module.exports = { generateComplaintStatusEmail, sendEmail };