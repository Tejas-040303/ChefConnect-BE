const Customer = require('../../models/Customer/CustomerSchema');
const Chef = require('../../models/Chef/ChefSchema');
const Order = require('../../models/Chef/OrderSchema');
const Dish = require('../../models/Chef/DishSchema');

// Helper functions from your recommendation model
const createUserItemMatrix = (orders, customers, chefs) => {
    // Count orders for each customer-chef pair
    const userItemMatrix = {};
    
    for (const order of orders) {
        const customerId = order.customer.toString();
        const chefId = order.chef.toString();
        
        if (!userItemMatrix[customerId]) {
            userItemMatrix[customerId] = {};
        }
        
        if (!userItemMatrix[customerId][chefId]) {
            userItemMatrix[customerId][chefId] = 0;
        }
        
        userItemMatrix[customerId][chefId] += 1;
    }
    
    return userItemMatrix;
};

const calculateCosineSimilarity = (userItemMatrix, userId1, userId2) => {
    const user1Items = userItemMatrix[userId1] || {};
    const user2Items = userItemMatrix[userId2] || {};
    
    // Get common items
    const commonItems = Object.keys(user1Items).filter(itemId => user2Items[itemId]);
    
    if (commonItems.length === 0) return 0;
    
    // Calculate dot product
    let dotProduct = 0;
    for (const itemId of commonItems) {
        dotProduct += user1Items[itemId] * user2Items[itemId];
    }
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(
        Object.values(user1Items).reduce((sum, val) => sum + val * val, 0)
    );
    
    const magnitude2 = Math.sqrt(
        Object.values(user2Items).reduce((sum, val) => sum + val * val, 0)
    );
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
};

const getRecommendedChefs = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        // Fetch necessary data
        const customer = await Customer.findById(customerId);
        const chefs = await Chef.find({ isVerified: true });
        const allOrders = await Order.find({}).populate('dishes.dish');
        const dishes = await Dish.find({});
        
        // Check if customer has order history
        const customerOrders = allOrders.filter(order => 
            order.customer.toString() === customerId.toString()
        );
        
        let recommendedChefs = [];
        
        if (customerOrders.length > 0) {
            // Use collaborative filtering for existing customers
            console.log("Using collaborative filtering for existing customer");
            
            // Create user-item matrix
            const userItemMatrix = createUserItemMatrix(allOrders, [customer], chefs);
            
            // Find similar users
            const similarUsers = {};
            const currentUserId = customerId.toString();
            
            for (const userId in userItemMatrix) {
                if (userId !== currentUserId) {
                    const similarity = calculateCosineSimilarity(userItemMatrix, currentUserId, userId);
                    if (similarity > 0) {
                        similarUsers[userId] = similarity;
                    }
                }
            }
            
            // Get chefs ordered by similar users but not by current user
            const customerChefsSet = new Set(customerOrders.map(order => order.chef.toString()));
            const chefScores = {};
            
            for (const [similarUserId, similarity] of Object.entries(similarUsers)) {
                const similarUserOrders = allOrders.filter(
                    order => order.customer.toString() === similarUserId
                );
                
                for (const order of similarUserOrders) {
                    const chefId = order.chef.toString();
                    if (!customerChefsSet.has(chefId)) {
                        if (!chefScores[chefId]) {
                            chefScores[chefId] = 0;
                        }
                        chefScores[chefId] += similarity;
                    }
                }
            }
            
            // Get top chefs based on scores
            const topChefIds = Object.entries(chefScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(entry => entry[0]);
            
            if (topChefIds.length > 0) {
                recommendedChefs = await Chef.find({
                    _id: { $in: topChefIds },
                    isVerified: true
                }).lean();
            }
            
            // If not enough recommendations, supplement with content-based
            if (recommendedChefs.length < 3) {
                // Use content-based as fallback
                const contentBasedChefs = await getContentBasedRecommendations(
                    customer, 
                    chefs.filter(chef => !recommendedChefs.some(rc => rc._id.toString() === chef._id.toString()))
                );
                
                recommendedChefs = [
                    ...recommendedChefs,
                    ...contentBasedChefs.slice(0, 3 - recommendedChefs.length)
                ];
            }
        } else {
            // Use content-based filtering for new customers
            console.log("Using content-based filtering for new customer");
            recommendedChefs = await getContentBasedRecommendations(customer, chefs);
        }
        
        // Format results
        const formattedRecommendations = recommendedChefs.map(chef => ({
            _id: chef._id,
            name: chef.name,
            location: chef.location,
            specialty: chef.specialties.join(", "),
            minimumOrder: chef.minimumOrder,
            img: chef.profileImage || '/default-chef.jpg',
            isRecommended: true
        }));
        
        res.status(200).json(formattedRecommendations);
    } catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chef recommendations',
            error: error.message
        });
    }
};

async function getContentBasedRecommendations(customer, chefs, limit = 3) {
    // Calculate scores based on customer preferences and chef specialties
    const scoredChefs = chefs.map(chef => {
        let score = chef.averageRating ? chef.averageRating / 5 * 0.5 : 0;
        
        // Add score for experience
        score += chef.experience ? (chef.experience / 10) * 0.2 : 0;
        
        // Match customer cuisine preferences with chef specialties
        if (customer.specialtiesPreferences && customer.specialtiesPreferences.length > 0) {
            const matchedSpecialties = chef.specialties.filter(
                specialty => customer.specialtiesPreferences.includes(specialty)
            );
            
            const matchRatio = matchedSpecialties.length / customer.specialtiesPreferences.length;
            score += matchRatio * 0.3;
        }
        
        return {
            ...chef.toObject(),
            score
        };
    });
    
    // Sort by score and return top recommendations
    return scoredChefs.sort((a, b) => b.score - a.score).slice(0, limit);
}

function calculateDynamicPrice(chef) {
    if (chef.dishes && chef.dishes.length > 0) {
        const prices = chef.dishes.map(dish => dish.price);
        return Math.min(...prices);
    }
    return 0;
}

module.exports = {
    getRecommendedChefs
};