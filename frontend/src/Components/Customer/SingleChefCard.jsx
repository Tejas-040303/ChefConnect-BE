// Update the SingleChefCard component to display minimum order pricing consistently
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRupeeSign } from "react-icons/fa";

function SingleChefCard({
  chefId,
  chefPhotoPath,
  chefName,
  chefLocation,
  chefSpecialty,
  minimumOrder,
  highlightText,
  isRecommended = false
}) {
  const navigate = useNavigate();

  const handleQuickView = () => {
    navigate(`/customer/ChefCompleteDetails/${chefId}`);
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    const searchTermLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    if (!textLower.includes(searchTermLower)) return text;
    const startIndex = textLower.indexOf(searchTermLower);
    const endIndex = startIndex + searchTerm.length;
    return (
      <>
        {text.substring(0, startIndex)}
        <span className="bg-yellow-200 font-semibold">
          {text.substring(startIndex, endIndex)}
        </span>
        {text.substring(endIndex)}
      </>
    );
  };

  // Format price with two decimal places for consistency
  const formattedPrice = minimumOrder ? parseFloat(minimumOrder).toFixed(2) : '0.00';

  return (
    <div className="chef-card bg-gray-100 p-4 rounded-lg border border-amber-500 hover:shadow-lg transition-all duration-200 relative">
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white px-2 py-1 rounded-bl-lg text-sm font-bold z-10">
          Recommended
        </div>
      )}
      <img
        src={chefPhotoPath}
        alt={chefName}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <h3 className="text-lg font-bold text-black">
        {highlightText ? highlightMatch(chefName, highlightText) : chefName}
      </h3>
      <p className="text-gray-600">
        Location: {highlightText ? highlightMatch(chefLocation, highlightText) : chefLocation}
      </p>
      <p className="text-gray-600">
        Specialty: {highlightText ? highlightMatch(chefSpecialty, highlightText) : chefSpecialty}
      </p>

      {/* Display minimum order price with consistent formatting */}
      <div className="flex items-center mt-2">
        <span className="text-amber-600 font-semibold">Minimum Order: </span>
        <span className="text-amber-600 font-bold ml-1" ><FaRupeeSign className="inline text-sm" />{formattedPrice}</span>
      </div>

      <button
        onClick={handleQuickView}
        className="bg-amber-500 text-white px-4 py-2 rounded-lg mt-3 block text-center hover:bg-amber-600 transition-colors duration-200 w-full"
        aria-label={`View ${chefName}'s profile`}
      >
        View Profile
      </button>
    </div>
  );
}

export default SingleChefCard;