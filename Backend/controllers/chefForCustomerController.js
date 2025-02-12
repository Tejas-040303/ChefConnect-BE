const Chef = require('../models/ChefSchema');

exports.getChefsForDashboard = async (req, res) => {
    try {
        const chefs = await Chef.find({})
            .select('name specialties dishes schedule')
            .lean();

        const formattedChefs = chefs.map(chef => ({
            _id: chef._id,
            name: chef.name,
            specialty: chef.specialties.join(", "),
            price: calculateDynamicPrice(chef), // Add your pricing logic
            img: chef.profileImage || '/default-chef.jpg'
        }));

        res.status(200).json(formattedChefs);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chefs',
            error: error.message
        });
    }
};

// Example pricing logic (modify as needed)
function calculateDynamicPrice(chef) {
    const basePrice = 50;
    const experienceMultiplier = chef.schedule?.length > 3 ? 1.2 : 1;
    return Math.round(basePrice * experienceMultiplier);
}