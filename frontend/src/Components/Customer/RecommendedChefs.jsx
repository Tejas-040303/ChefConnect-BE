import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion"; // For animations (install if not already there)

function RecommendedChefs({ recommendedChefs, loading }) {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="bg-gray-200 rounded-lg h-48 w-64"></div>
            <div className="bg-gray-200 rounded-lg h-48 w-64"></div>
            <div className="bg-gray-200 rounded-lg h-48 w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendedChefs || recommendedChefs.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedChefs.map((chef) => (
          <RecommendedChefCard key={chef._id} chef={chef} />
        ))}
      </div>
    </div>
  );
}

function RecommendedChefCard({ chef }) {
  // Extract specialties as a comma-separated string
  const specialtiesString = chef.specialties ? chef.specialties.join(", ") : "";
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <Link to={`/customer/chefdetails/${chef._id}`}>
        <div className="relative h-40 bg-gradient-to-r from-yellow-400 to-orange-500">
          {chef.profileImage ? (
            <img
              src={chef.profileImage}
              alt={chef.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {chef.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
            <FaHeart className="text-red-500" />
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{chef.name}</h3>
            <div className="flex items-center">
              <FaStar className="text-yellow-500 mr-1" />
              <span>{chef.averageRating?.toFixed(1) || "New"}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-2">
            {chef.location?.split(',')[0]}
          </p>
          
          <p className="text-gray-700 text-sm mb-3">
            Specialties: {specialtiesString || "Various cuisines"}
          </p>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Min Order: ₹{chef.minimumOrder || 200}
            </span>
            <span className="text-sm font-medium">
              {chef.experience} years exp.
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default RecommendedChefs;