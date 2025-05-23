
const Chef = require('../../models/Chef/ChefSchema');
const fs = require('fs');
const path = require('path');

exports.getChefDetailsById = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id)
      .select('-email -password')
      .populate('dishes');
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }
    
    res.json(chef);
  } catch (error) {
    console.error('Error fetching chef details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New endpoint to fetch QR code image specifically

exports.getChefQRCode = async (req, res) => {
  try {
    console.log(`Fetching QR code for chef ID: ${req.params.id}`);
    
    const chef = await Chef.findById(req.params.id).select('qrCodeImage upiId paymentPhoneNumber');
    
    if (!chef) {
      console.log('Chef not found');
      return res.status(404).json({ message: 'Chef not found' });
    }
    
    console.log('Chef QR code data:', {
      hasQrCode: !!chef.qrCodeImage,
      qrCodeValue: chef.qrCodeImage,
      upiId: chef.upiId,
      paymentPhoneNumber: chef.paymentPhoneNumber
    });
    
    if (!chef.qrCodeImage) {
      return res.status(404).json({ message: 'QR code not available' });
    }
    
    // Always return JSON with the QR code URL and payment details
    // This is more reliable than trying to serve the image directly
    return res.json({
      qrCodeUrl: chef.qrCodeImage.startsWith('http') 
        ? chef.qrCodeImage 
        : `http://localhost:8080/uploads/qrcodes/${chef.qrCodeImage}`,
      upiId: chef.upiId,
      paymentPhoneNumber: chef.paymentPhoneNumber
    });
    
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ message: 'Server error' });
  }
};