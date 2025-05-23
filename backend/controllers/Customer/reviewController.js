const Review = require('../../models/Chef/ReviewSchema');
const Chef = require('../../models/Chef/ChefSchema');
const Order = require('../../models/Chef/OrderSchema');

// Submit a review for a chef
const submitReview = async (req, res) => {
  try {
    const { chefId, orderId, rating, review } = req.body;
    const customerId = req.user._id || req.user.id;

    // Validate the order exists and belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== customerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    // Check if payment is completed
    if (order.paymentStatus !== 'Completed') {
      return res.status(400).json({ message: 'Cannot review an order before payment is completed' });
    }

    // Check if a review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review for this order' });
    }

    // Create the review
    const newReview = new Review({
      customer: customerId,
      chef: chefId,
      order: orderId,
      rating,
      review
    });

    await newReview.save();

    // Update chef's average rating
    const allChefReviews = await Review.find({ chef: chefId });
    
    const totalRating = allChefReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allChefReviews.length;
    
    // Update chef with new average rating and increment review count
    await Chef.findByIdAndUpdate(chefId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: allChefReviews.length
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

// Get reviews for a specific chef
const getChefReviews = async (req, res) => {
  try {
    const { chefId } = req.params;
    
    const reviews = await Review.find({ chef: chefId })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });
      
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching chef reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

module.exports = {
  submitReview,
  getChefReviews
};