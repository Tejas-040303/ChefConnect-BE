// controllers/chefInfoController.js
const Chef = require('../models/ChefSchema'); // Assuming your Chef model exists

exports.getChefDetails = async (req, res) => {
    try {
        const chefId = req.params.chefId;
        // Exclude the email and password fields from the response.
        const chef = await Chef.findById(chefId).select('-email -password');
        if (!chef) {
            return res.status(404).json({ message: 'Chef not found' });
        }
        res.status(200).json(chef);
    } catch (error) {
        console.error("Error fetching chef details:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
