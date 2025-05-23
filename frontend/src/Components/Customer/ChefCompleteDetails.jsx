import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRupeeSign } from "react-icons/fa";

function ChefCompleteDetails() {
  const { id } = useParams(); // Get chef ID from URL parameters
  const [chefData, setChefData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // or sessionStorage, depending on your auth flow

        const response = await axios.get(
          `http://localhost:8080/customer/chefdetails/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }         
        );
        setChefData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchChefDetails();
  }, [id]);

  const fetchReviews = async () => {
    if (reviews.length > 0 && showReviews) {
      // If we already have reviews and we're just toggling visibility, don't fetch again
      setShowReviews(!showReviews);
      return;
    }

    setReviewsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/customer/reviews/chef/${id}`);
      setReviews(response.data);
      setShowReviews(true);
      setReviewsLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviewsLoading(false);
    }
  };

  const handleProceed = () => {
    navigate(`/customer/BookThisChef/${id}`);
  }

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  }

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle loading, error, and no-data states
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 mx-auto max-w-4xl my-8 rounded shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      </div>
    </div>
  );

  if (!chefData) return (
    <div className="bg-gray-50 border-l-4 border-gray-500 p-6 mx-auto max-w-4xl my-8 rounded shadow-md">
      <p className="text-gray-600">Chef not found</p>
    </div>
  );

  // Calculate rating as average of reviews or use the one from chefData
  const rating = chefData.averageRating || chefData.rating || 0;
  const reviewCount = chefData.reviewCount || 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-white/10 rounded-xl shadow-lg p-8 max-w-4xl mx-auto mb-16 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 flex items-center text-amber-700 hover:text-amber-800 transition-colors font-medium"
      >
        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-amber-200 pb-6 pt-8">
        <h2 className="text-3xl font-bold text-amber-800">Chef Profile</h2>
        <button
          className="mt-4 md:mt-0 bg-amber-700 hover:bg-amber-800 transition-colors text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center font-medium"
          onClick={handleProceed}
        >
          Book This Chef
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Personal Info with Circular Image */}
        <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-amber-800 mb-4 border-b border-amber-100 pb-2">Personal Info</h3>

          {/* Chef Circular Image */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 shadow-md border-4 border-amber-100">
              {chefData.profileImage ? (
                <img
                  src={chefData.profileImage}
                  alt={`Chef ${chefData.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-300">
                  <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 text-gray-700">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium">{chefData.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Location</p>
              <p className="font-medium">{chefData.location}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="font-medium">{chefData.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Address</p>
              <p className="font-medium">{chefData.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Experience</p>
              <p className="font-medium">{chefData.experience || 0} years</p>
            </div>
          </div>
        </div>

        {/* About & Services with Rating at Bottom */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-amber-800 mb-4 border-b border-amber-100 pb-2">About Chef</h3>

          <div className="space-y-4 text-gray-700">
            <div>
              <p className="text-gray-500 text-sm">Bio</p>
              <p className="italic">{chefData.bio || 'Not provided'}</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <div className="bg-amber-50 px-4 py-2 rounded-lg">
                <p className="text-gray-500 text-sm">Availability</p>
                <p className={`font-medium ${chefData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {chefData.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
                </p>
              </div>

              <div className="bg-amber-50 px-4 py-2 rounded-lg">
                <p className="text-gray-500 text-sm">Delivery Radius</p>
                <p className="font-medium">{chefData.deliveryRadius || 0} km</p>
              </div>

              <div className="bg-amber-50 px-4 py-2 rounded-lg">
                <p className="text-gray-500 text-sm">Minimum Order</p>
                <p className="font-medium"><FaRupeeSign className="inline text-sm" />{chefData.minimumOrder || 0}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-sm">Specialties</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(chefData.specialties || []).length > 0 ? (
                  chefData.specialties.map((specialty, index) => (
                    <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None specified</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-sm">Payment Methods</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(chefData.paymentMethods || []).length > 0 ? (
                  chefData.paymentMethods.map((method, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {method}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None specified</span>
                )}
              </div>
            </div>

            {/* Rating at Bottom - Enhanced */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm mb-2">Chef Rating</p>
              </div>
              <div className="flex items-center">
                <div className="flex text-amber-400">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className={`h-6 w-6 ${i < Math.floor(rating) ? 'text-amber-400' : (i < rating ? 'text-amber-300' : 'text-gray-300')}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-amber-800 font-bold text-lg">{rating.toFixed(1)}</span>
                <span className="ml-2 text-sm text-gray-500">({reviewCount} reviews)</span>

                <button
                  onClick={fetchReviews}
                  className="ml-auto flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  {reviewsLoading ? 'Loading...' : (showReviews ? 'Hide Reviews' : 'Show Reviews')}
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${showReviews ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {showReviews && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-amber-800 mb-4 border-b border-amber-100 pb-2">
            Customer Reviews ({reviews.length})
          </h3>

          {reviewsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                      {review.customer?.profileImage ? (
                        <img
                          src={review.customer.profileImage}
                          alt={review.customer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-300">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800">{review.customer?.name || 'Anonymous'}</h4>
                        <p className="text-xs text-gray-500">{formatDate(review.date || review.createdAt)}</p>
                      </div>
                      <div className="flex text-amber-400 mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {review.review ? (
                        <p className="text-gray-600">{review.review}</p>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No written review provided</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-amber-800 mb-4 border-b border-amber-100 pb-2">Weekly Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chefData.schedule?.map((daySchedule) => (
            <div key={daySchedule.day} className={`p-4 rounded-lg shadow-sm ${daySchedule.isWorking ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-medium">{daySchedule.day}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daySchedule.isWorking ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {daySchedule.isWorking ? 'AVAILABLE' : 'UNAVAILABLE'}
                </span>
              </div>
              {daySchedule.isWorking && daySchedule.slots.length > 0 && (
                <div className="space-y-2 mt-2">
                  {daySchedule.slots.map((slot, index) => (
                    <div key={index} className="bg-white rounded border border-gray-100 px-3 py-2 text-sm flex justify-between">
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span className="text-amber-700 font-medium">Max: {slot.maxOrders}</span>
                    </div>
                  ))}
                </div>
              )}
              {daySchedule.isWorking && daySchedule.slots.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No specific time slots</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dishes Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-amber-800 mb-4 border-b border-amber-100 pb-2">Menu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(chefData.dishes || []).length > 0 ? (
            chefData.dishes.map((dish) => (
              <div key={dish._id} className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-amber-50 p-3 border-b border-amber-100">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-amber-800">{dish.name}</h4>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      <FaRupeeSign className="inline text-xs mb-1" />{dish.price}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-500">{dish.category}</span>
                    {dish.subCategory && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{dish.subCategory}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-600 mb-3">{dish.description || 'No description available.'}</p>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {(dish.ingredients || []).length > 0 ? (
                        dish.ingredients.map((ingredient, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {ingredient}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500 py-8">No dishes available</p>
          )}
        </div>
      </div>

      {/* Proceed Button - Bottom */}
      <div className="mt-8 flex justify-center">
        <button
          className="bg-amber-700 hover:bg-amber-800 transition-colors text-white px-8 py-4 rounded-lg shadow-md flex items-center justify-center font-medium text-lg"
          onClick={handleProceed}
        >
          Book This Chef
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChefCompleteDetails;