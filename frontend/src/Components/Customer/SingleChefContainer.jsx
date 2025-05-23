import React, { useState, useEffect } from "react";
import SingleChefCard from "./SingleChefCard";
import RecommendedChefs from "./RecommendedChefs";
import axios from "axios";

function SingleChefContainer({ appliedFilters, searchQuery }) {
  const [chefData, setChefData] = useState([]);
  const [recommendedChefIds, setRecommendedChefIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const chefResponse = await axios.get("http://localhost:8080/customer/dashboard/chefDetails", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(chefResponse.data);
        if (chefResponse.data && Array.isArray(chefResponse.data)) {
          setChefData(chefResponse.data);
        } else {
          setError("Invalid data format received");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching chef data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const timer = setTimeout(() => setShowScrollIndicator(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredChefData = chefData.filter((chef) => {
    if (recommendedChefIds.has(chef._id)) {
      return false;
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = chef.name && chef.name.toLowerCase().includes(query);
      const specialtyMatch = chef.specialty && chef.specialty.toLowerCase().includes(query);
      const locationMatch = chef.location && chef.location.toLowerCase().includes(query);
      
      if (!nameMatch && !specialtyMatch && !locationMatch) {
        return false;
      }
    }

    let matches = true;
    if (appliedFilters) {
      if (appliedFilters.rating && chef.rating) {
        matches = matches && chef.rating >= Number(appliedFilters.rating);
      }
      
      if (appliedFilters.priceRange && chef.minimumOrder) {
        const minOrder = parseFloat(chef.minimumOrder);
        matches = matches && minOrder >= appliedFilters.priceRange[0] && minOrder <= appliedFilters.priceRange[1];
      }
      
      if (appliedFilters.location) {
        matches = matches && chef.location && chef.location.toLowerCase().includes(appliedFilters.location.toLowerCase());
      }
      
      if (appliedFilters.specialties && appliedFilters.specialties.length > 0) {
        const chefSpecialties = chef.specialty ? chef.specialty.split(",").map(s => s.trim()) : [];
        matches = matches && chefSpecialties.length > 0 && appliedFilters.specialties.some(spec => 
          chefSpecialties.includes(spec)
        );
      }
    }
    
    return matches;
  });

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setShowScrollIndicator(false);
    } else if (!showScrollIndicator && e.target.scrollTop > 0) {
      setShowScrollIndicator(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white bg-opacity-90 rounded-lg shadow-md">
        <div className="animate-spin text-4xl mb-4">🍕</div>
        <p className="text-gray-700 font-semibold">Loading chef profiles...</p>
        <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500 text-xl">⚠️</div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-700">Error loading chefs</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition duration-150 ease-in-out text-sm"
              onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if both filtered chefs and recommended chefs (after filtering) are empty
  const noResults = filteredChefData.length === 0;

  return (
    <div className="relative">
      <div
        className="chef-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[100vh] overflow-y-auto p-4 rounded-lg bg-gray-50"
        onScroll={handleScroll}>
          
        {/* Recommended Chefs with filters applied */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <RecommendedChefs 
            setRecommendedChefIds={setRecommendedChefIds} 
            appliedFilters={appliedFilters}
            searchQuery={searchQuery}
          />
        </div>
        
        {/* No results message */}
        {noResults && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-8 bg-white bg-opacity-90 rounded-lg shadow-lg text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No chefs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `No chefs matching "${searchQuery}"` : "No chefs match the selected filters"}
            </p>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300">
              Reset All Filters
            </button>
          </div>
        )}
        
        {/* Regular chefs listing */}
        {filteredChefData.map((chef) => (
          <SingleChefCard
            key={chef._id}
            chefId={chef._id}
            chefPhotoPath={chef.img}
            chefName={chef.name}
            chefLocation={chef.location}
            chefSpecialty={chef.specialty}
            minimumOrder={chef.minimumOrder}
            highlightText={searchQuery}
            className="transform transition duration-300 hover:scale-105"
          />
        ))}
      </div>
      
      {showScrollIndicator && filteredChefData.length > 3 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-gray-600 text-sm mb-1">Scroll for more</span>
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      )}
      
      <div className="mt-4 text-right text-sm text-gray-500">
        Showing {filteredChefData.length} {filteredChefData.length === 1 ? 'chef' : 'chefs'}
      </div>
    </div>
  );
}

export default SingleChefContainer;