import React from 'react';

function PremiumCard({ PlanName, Price, Description, isHighlighted = false, isLarger = false }) {
  // Determine offer/discount text based on plan (customizable)
  const getOfferText = () => {
    switch (PlanName) {
      case 'Bronze (Free)':
        return 'Free Forever!';
      case 'Silver (Pro)':
        return 'Save 10% Today!';
      case 'Gold (Pro+)':
        return 'Best Value – 15% Off!';
      default:
        return '';
    }
  };

  return (
    <div
      className={`premium-card bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 h-full w-full ${
        isHighlighted ? (isLarger ? 'scale-120 transform max-w-md' : 'scale-105 transform max-w-sm') : 'max-w-sm'
      }`}
    >
      {/* Offer/Discount Tag */}
      {getOfferText() && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
          {getOfferText()}
        </div>
      )}

      <div className="card-header">
        <h4 className="plan-name text-2xl font-bold text-orange-600">{PlanName}</h4>
        <h6 className="plan-price text-xl text-gray-800">${Price}/month</h6>
      </div>
      <div className="card-body mt-4 flex-grow">
        <ul className="features-list space-y-2">
          {Description.map((feature, index) => (
            <li key={index} className="feature-item text-gray-600 text-sm flex items-center justify-center">
              <span className="mr-2 text-orange-500">✓</span> {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="card-footer mt-6">
        {/* Conditionally render based on plan */}
        {PlanName === 'Bronze (Free)' ? (
          <p className="text-gray-600 text-sm font-medium">Current Plan <br />after you Signup</p>
        ) : (
          <button className="buy-btn bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300">
            Buy Membership (${Price})
          </button>
        )}
      </div>
    </div>
  );
}

export default PremiumCard;