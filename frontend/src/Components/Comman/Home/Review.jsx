import React, { useReducer, useState } from "react";
import axios from "axios";

const initialFormState = { name: "", email: "", review: "" };

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

function Review() {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const smileys = [
    { label: "Very Sad", emoji: "😞", value: 1 },
    { label: "Sad", emoji: "😟", value: 2 },
    { label: "Neutral", emoji: "😐", value: 3 },
    { label: "Happy", emoji: "😊", value: 4 },
    { label: "Very Happy", emoji: "😁", value: 5 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
  };

  const handleRating = (value) => {
    setRating(value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === null) {
      alert("Please select a rating!");
      return;
    }
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:8080/comman/userreviews", {
        name: formData.name,
        email: formData.email,
        review: formData.review,
        rating: rating,
      });
      if (response.status === 201) {
        setSubmitted(true);
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("An error occurred while submitting the review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
    setRating(null);
    setSubmitted(false);
  };

  return (
    <section className="bg-gradient-to-b from-orange-100 via-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          Share Your Experience
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          {smileys.map((smiley) => (
            <button
              key={smiley.value}
              type="button"
              className={`text-3xl p-2 rounded-full transition-all ${
                rating === smiley.value
                  ? "bg-orange-200 scale-125"
                  : "hover:bg-orange-100 hover:scale-110"
              }`}
              onClick={() => handleRating(smiley.value)}
              title={smiley.label}
              aria-label={`Rate ${smiley.label}`}
            >
              {smiley.emoji}
            </button>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-orange-500 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-orange-500 mb-1"
              >
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="review"
                className="block text-sm font-medium text-orange-500 mb-1"
              >
                Your Review
              </label>
              <textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleChange}
                placeholder="Share your thoughts"
                required
                rows="4"
                className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-orange-500">
              Thank You!
            </h3>
            <p className="text-orange-500">
              Your review has been submitted successfully.
            </p>
            <p className="text-orange-500">
              Your Rating:{" "}
              <span className="font-medium">
                {smileys.find((smiley) => smiley.value === rating)?.label} (
                {smileys.find((smiley) => smiley.value === rating)?.emoji})
              </span>
            </p>
            <button
              onClick={handleReset}
              className="mt-4 py-2 px-4 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            >
              Submit Another Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Review;