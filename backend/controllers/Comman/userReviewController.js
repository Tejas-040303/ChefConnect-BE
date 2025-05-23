const Review = require("../../models/Comman/userReviewSchema");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { name, email, review, rating } = req.body;

    // Validate required fields
    if (!name || !email || !review || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save review in the database
    const newReview = new Review({ name, email, review, rating });
    await newReview.save();

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
