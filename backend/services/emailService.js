const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: true
});

const sendOrderStatusEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"ChefConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendQueryStatusEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"ChefConnect Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Query status email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending query status email:', error);
    throw error;
  }
};

const sendComplaintStatusEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"ChefConnect Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Complaint status email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending complaint status email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderStatusEmail,
  sendQueryStatusEmail,
  sendComplaintStatusEmail
};