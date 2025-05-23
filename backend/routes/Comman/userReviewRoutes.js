const express = require("express");
const { createReview, getReviews } = require("../../controllers/Comman/userReviewController");

const router = express.Router();

// Route to create a new review
router.post("/", createReview);

// Route to get all reviews
router.get("/", getReviews);

module.exports = router;