
import React, { useState } from 'react';
import '../../../public/css/CommanCss/SubmitReview.css';

function SubmitReview() {
    const [formData, setFormData] = useState({ name: '', email: '', review: '' });
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRating = (value) => {
        setRating(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === null) {
            alert("Please select a rating before submitting!");
            return;
        }
        setSubmitted(true);
    };

    const smileys = [
        { label: "Very Sad", emoji: "😞", value: 1 },
        { label: "Sad", emoji: "😟", value: 2 },
        { label: "Neutral", emoji: "😐", value: 3 },
        { label: "Happy", emoji: "😊", value: 4 },
        { label: "Very Happy", emoji: "😁", value: 5 },
    ];

    return (
        <section className="submit-review-section">
            <div className="form-container">
                <h2 className="form-title">Share Your Experience</h2>
                <div className="smiley-rating-container">
                    <div className="smiley-rating">
                        {smileys.map((smiley) => (
                            <div
                                key={smiley.value}
                                className={`smiley ${rating === smiley.value ? 'active' : ''}`}
                                onClick={() => handleRating(smiley.value)}
                                title={smiley.label}
                            >
                                {smiley.emoji}
                            </div>
                        ))}
                    </div>
                </div>
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="review-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Your Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="review" className="form-label">Your Review</label>
                            <textarea
                                id="review"
                                name="review"
                                className="form-input"
                                rows="5"
                                value={formData.review}
                                onChange={handleChange}
                                placeholder="Share your thoughts"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="form-submit-btn">Submit </button>
                    </form>
                ) : (
                    <div className="thank-you-message">
                        <h3>Thank You!</h3>
                        <p>Your review has been submitted successfully.</p>
                        <p>Your Rating: {smileys.find((smiley) => smiley.value === rating)?.label}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default SubmitReview;

