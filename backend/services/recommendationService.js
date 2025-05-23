// services/recommendationService.js
const User = require('../models/Comman/UserSchema');
const Chef = require('../models/Chef/ChefSchema');
const Customer = require('../models/Customer/CustomerSchema');
const Order = require('../models/Chef/OrderSchema');
const Dish = require('../models/Chef/DishSchema');

exports.getChefRecommendations = async (customerId, limit = 3) => {
  try {
    // Get customer details with preferences
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get customer's past orders with chefs and dishes
    const pastOrders = await Order.find({ customer: customerId })
      .populate('chef')
      .populate({
        path: 'dishes.dish',
        model: 'Dish'
      });

    // Get all available chefs
    const allChefs = await Chef.find({ isAvailable: true, status: 'active' });
    
    // Calculate recommendation scores for each chef
    const chefsWithScores = allChefs.map(chef => {
      let score = 0;
      
      // 1. Score based on cuisine preference match
      if (customer.preference && chef.specialties) {
        const customerPreferences = customer.preference.toLowerCase().split(',').map(p => p.trim());
        const chefSpecialties = chef.specialties.map(s => s.toLowerCase().trim());
        
        // Add points for each matching specialty
        customerPreferences.forEach(pref => {
          if (chefSpecialties.some(spec => spec.includes(pref) || pref.includes(spec))) {
            score += 10;
          }
        });
      }
      
      // 2. Score based on dietary restrictions match
      if (customer.dietaryRestrictions && chef.specialties) {
        const dietaryRestrictions = customer.dietaryRestrictions.toLowerCase().split(',').map(d => d.trim());
        const chefSpecialties = chef.specialties.map(s => s.toLowerCase().trim());
        
        // Check if chef has specialties that match dietary restrictions
        const dietaryMatches = dietaryRestrictions.filter(diet => 
          chefSpecialties.some(spec => spec.includes(diet))
        );
        
        score += dietaryMatches.length * 5;
      }
      
      // 3. Score based on past orders with this chef
      const ordersWithChef = pastOrders.filter(order => 
        order.chef && order.chef._id.toString() === chef._id.toString()
      );
      
      // Add points for each past order with this chef
      score += ordersWithChef.length * 15;
      
      // 4. Score based on chef's rating
      if (chef.averageRating) {
        score += chef.averageRating * 3;
      }
      
      // 5. Score based on chef's experience
      if (chef.experience) {
        // Add 1 point for each year of experience, up to 10 points
        score += Math.min(chef.experience, 10);
      }
      
      // 6. Adjust score based on distance/location if available
      if (customer.location && chef.location) {
        // Basic location matching (exact match gives points)
        // In a real app, you might use geocoding or distance calculation
        if (customer.location.toLowerCase().includes(chef.location.toLowerCase()) || 
            chef.location.toLowerCase().includes(customer.location.toLowerCase())) {
          score += 8;
        }
      }
      
      // Convert Chef mongoose model to plain object
      const chefObj = chef.toObject();
      
      return {
        ...chefObj,
        recommendationScore: score
      };
    });
    
    // Sort by score and get top recommendations
    const recommendations = chefsWithScores
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Error in recommendation service:', error);
    throw error;
  }
};

/**
 * Get collaborative filtering recommendations based on order history
 * @param {Object} customer - Customer object
 * @param {Array} orderHistory - Array of customer's orders
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended chef objects
 */
async function getCollaborativeRecommendations(customer, orderHistory, limit) {
    // Extract chefs the customer has ordered from
    const orderedChefIds = new Set(orderHistory.map(order => order.chef._id.toString()));
    
    // Get dietary preference of the customer
    const customerPreference = customer.preference || 'None';
    
    // Find dishes ordered by this customer
    const orderDishes = await getDishesFromOrders(orderHistory);
    const orderedCategories = getFrequentCategories(orderDishes);
    
    // Find similar customers based on dietary preferences and dish categories
    const similarCustomers = await Customer.find({
        _id: { $ne: customer._id },
        preference: customerPreference
    });
    
    // Get orders from similar customers
    const similarCustomerOrders = await Order.find({
        customer: { $in: similarCustomers.map(c => c._id) }
    }).populate('chef').populate('dishes.dish');
    
    // Count chefs ordered by similar customers
    const chefScores = {};
    
    for (const order of similarCustomerOrders) {
        const chefId = order.chef._id.toString();
        
        // Skip chefs the customer has already ordered from
        if (orderedChefIds.has(chefId)) {
            continue;
        }
        
        // Check if dishes in this order match customer's frequently ordered categories
        const orderDishCategories = order.dishes.map(d => d.dish.category);
        const categoryMatch = orderDishCategories.some(cat => orderedCategories.includes(cat));
        
        // Increment score based on category match
        if (!chefScores[chefId]) {
            chefScores[chefId] = 0;
        }
        
        chefScores[chefId] += categoryMatch ? 2 : 1;
    }
    
    // Sort chefs by score and get top recommendations
    const topChefIds = Object.entries(chefScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);
    
    // Get full chef objects
    if (topChefIds.length > 0) {
        return await Chef.find({ _id: { $in: topChefIds } });
    }
    
    // If we don't have enough collaborative recommendations, fall back to content-based
    return await getContentBasedRecommendations(customer, limit);
}

/**
 * Get content-based recommendations based on customer preferences
 * @param {Object} customer - Customer object
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended chef objects
 */
async function getContentBasedRecommendations(customer, limit) {
    // Match chefs by dietary preference and specialties
    const query = {
        role: 'Chef',
        isAvailable: true,
        status: 'active'
    };
    
    // Add dietary preference matching if available
    if (customer.preference === 'Vegetarian') {
        query.specialties = { $in: ['Indian', 'Italian', 'Mediterranean'] };
    } else if (customer.preference === 'Vegan') {
        query.specialties = { $in: ['Mediterranean', 'Indian', 'Thai'] };
    } else if (customer.preference === 'Non-Vegetarian') {
        query.specialties = { $in: ['Indian', 'Mexican', 'Chinese'] };
    }
    
    // Sort by rating and experience for better recommendations
    const chefs = await Chef.find(query)
        .sort({ averageRating: -1, experience: -1 })
        .limit(limit);
    
    return chefs;
}

/**
 * Get other chefs that are not in the recommended list
 * @param {Array} excludeChefIds - Array of chef IDs to exclude
 * @returns {Promise<Array>} - Array of other chef objects
 */
async function getOtherChefs(excludeChefIds) {
    return await Chef.find({
        _id: { $nin: excludeChefIds },
        role: 'Chef',
        isAvailable: true,
        status: 'active'
    }).sort({ averageRating: -1 }).limit(10);
}

/**
 * Extract dishes from order history
 * @param {Array} orders - Array of order objects
 * @returns {Promise<Array>} - Array of dish objects
 */
async function getDishesFromOrders(orders) {
    const dishes = [];
    
    for (const order of orders) {
        for (const item of order.dishes) {
            if (typeof item.dish === 'object') {
                dishes.push(item.dish);
            } else {
                const dish = await Dish.findById(item.dish);
                if (dish) dishes.push(dish);
            }
        }
    }
    
    return dishes;
}

/**
 * Get most frequently ordered dish categories
 * @param {Array} dishes - Array of dish objects
 * @returns {Array} - Array of most frequent categories
 */
function getFrequentCategories(dishes) {
    const categoryCounts = {};
    
    for (const dish of dishes) {
        const category = dish.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Sort categories by frequency and return top 3
    return Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
}