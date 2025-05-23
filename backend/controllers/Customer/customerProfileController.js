const Customer = require('../../models/Customer/CustomerSchema');

exports.getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const customer = await Customer.findById(userId).populate('orderHistory favorites');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ customer });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const updates = {};
    
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.address) updates.address = req.body.address;
    if (req.body.preference) updates.preference = req.body.preference;
    if (req.body.notificationPreferences) updates.notificationPreferences = req.body.notificationPreferences;
    if (req.body.allergies) updates.allergies = req.body.allergies;
    if (req.body.dietaryRestrictions) updates.dietaryRestrictions = req.body.dietaryRestrictions;
    if (req.body.deliveryInstructions) updates.deliveryInstructions = req.body.deliveryInstructions;
    if (req.body.img) updates.img = req.body.img;
    // Add support for specialtiesPreferences
    if (req.body.specialtiesPreferences) updates.specialtiesPreferences = req.body.specialtiesPreferences;
    
    Object.assign(customer, updates);
    await customer.save();
    
    res.json({ message: 'Profile updated successfully', customer });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    const imageUrl = req.file.path;
    const customer = await Customer.findById(req.user._id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.img = imageUrl;
    await customer.save();
    
    res.json({ message: 'Profile image uploaded successfully', imageUrl: imageUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

// Backend Fix - controllers/Customer/customerProfileController.js
exports.removeProfileImage = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Store the previous image URL for Cloudinary cleanup
    const previousImageUrl = customer.img;
    
    // Set image to null
    customer.img = null;
    await customer.save();
    
    // Add Cloudinary cleanup
    if (previousImageUrl) {
      try {
        // Extract public_id from the URL
        // Typically Cloudinary URLs are like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
        const urlParts = previousImageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0]; // Remove file extension
        const folderPath = urlParts[urlParts.length - 2];
        const fullPublicId = `${folderPath}/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
        console.log(`Successfully removed image from Cloudinary: ${fullPublicId}`);
      } catch (cloudinaryError) {
        console.error("Error removing image from Cloudinary:", cloudinaryError);
        // We continue even if Cloudinary deletion fails, as the database update is most important
      }
    }
    
    res.json({ message: 'Profile image removed successfully' });
  } catch (error) {
    console.error("Image removal error:", error);
    res.status(500).json({ message: 'Error removing profile image', error: error.message });
  }
};
