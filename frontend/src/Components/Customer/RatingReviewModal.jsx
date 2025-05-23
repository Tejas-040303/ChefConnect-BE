import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingReviewModal = ({ isOpen, onClose, onSubmit, chefName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    await onSubmit(rating, review);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rate Your Experience</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">How was your experience with {chefName}?</p>
        
        <div className="flex justify-center mb-6">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index} className="cursor-pointer">
                <input 
                  type="radio" 
                  name="rating" 
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                  className="hidden"
                />
                <FaStar 
                  size={32}
                  className="mr-2"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Leave a review (optional)</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md resize-none h-32"
            placeholder="Share your experience..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingReviewModal;