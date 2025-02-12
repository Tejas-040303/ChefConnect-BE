const Chef = require('../models/ChefSchema');

const getChefDetails = async (req, res) => {
    try {
        const chef = await Chef.findById(req.params.chefId)
            .select('-email -password -__v -createdAt -updatedAt')
            .lean();

        if (!chef) {
            return res.status(404).json({ message: 'Chef not found' });
        }

        // Transform schedule data
        const transformedSchedule = chef.schedule?.map(day => ({
            day: day.day,
            available: day.isWorking,
            slots: day.slots
        })) || [];

        // Transform response structure
        const responseData = {
            ...chef,
            img: chef.profileImage || '/default-chef.jpg',
            specialty: chef.specialties?.join(', ') || '',
            schedule: transformedSchedule,
            // Ensure phone and location are included
            phone: chef.phone || '',
            location: chef.location || ''
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching chef details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getChefDetails };