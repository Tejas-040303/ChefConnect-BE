const Chef = require('../../models/Chef/ChefSchema');

exports.getChefsForDashboard = async (req, res) => {
  try {
    const chefs = await Chef.find({ isVerified: true })  // ✅ Filter here
      .select('name location minimumOrder specialties dishes schedule profileImage')
      .populate('dishes', 'price')
      .lean();

    const formattedChefs = chefs.map(chef => ({
      _id: chef._id,
      name: chef.name,
      location: chef.location,
      specialty: chef.specialties.join(", "),
      minimumOrder: chef.minimumOrder || 0,
      img: chef.profileImage || '/default-chef.jpg',
    }));

    res.status(200).json(formattedChefs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chefs',
      error: error.message,
    });
  }
};
