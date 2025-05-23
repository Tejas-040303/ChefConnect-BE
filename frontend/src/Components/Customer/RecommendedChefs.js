import React, { useState, useEffect } from "react";
import axios from "axios";
import SingleChefCard from "./SingleChefCard";

function RecommendedChefs({ setRecommendedChefIds, appliedFilters, searchQuery }) {
  const [recommendedChefs, setRecommendedChefs] = useState([]);
  const [filteredRecommendedChefs, setFilteredRecommendedChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendedChefs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/customer/recommendations/recommended-chefs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setRecommendedChefs(response.data);
          if (setRecommendedChefIds) {
            const recommendedIds = new Set(response.data.map(chef => chef._id));
            setRecommendedChefIds(recommendedIds);
          }
        } else {
          setError("Invalid data format received");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching chef recommendations");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedChefs();
  }, [setRecommendedChefIds]);

  // Apply filters to recommended chefs
  useEffect(() => {
    if (recommendedChefs.length > 0) {
      const filtered = recommendedChefs.filter((chef) => {
        // Apply search filter
        if (searchQuery && searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const nameMatch = chef.name && chef.name.toLowerCase().includes(query);
          const specialtyMatch = chef.specialty && chef.specialty.toLowerCase().includes(query);
          const locationMatch = chef.location && chef.location.toLowerCase().includes(query);
          
          if (!nameMatch && !specialtyMatch && !locationMatch) {
            return false;
          }
        }
        
        // Apply other filters
        let matches = true;
        if (appliedFilters) {
          // Rating filter
          if (appliedFilters.rating && chef.rating) {
            matches = matches && chef.rating >= Number(appliedFilters.rating);
          }
          
          // Price range filter
          if (appliedFilters.priceRange && chef.minimumOrder) {
            const minOrder = parseFloat(chef.minimumOrder);
            matches = matches && minOrder >= appliedFilters.priceRange[0] && minOrder <= appliedFilters.priceRange[1];
          }
          
          // Location filter
          if (appliedFilters.location) {
            matches = matches && chef.location && chef.location.toLowerCase().includes(appliedFilters.location.toLowerCase());
          }
          
          // Specialties filter
          if (appliedFilters.specialties && appliedFilters.specialties.length > 0) {
            const chefSpecialties = chef.specialty ? chef.specialty.split(",").map(s => s.trim()) : [];
            matches = matches && chefSpecialties.length > 0 && appliedFilters.specialties.some(spec => 
              chefSpecialties.includes(spec)
            );
          }
        }
        
        return matches;
      });
      
      setFilteredRecommendedChefs(filtered);
    }
  }, [recommendedChefs, appliedFilters, searchQuery]);

  if (loading)
    return (
      <div className="loading-container text-white text-center">
        <div className="spinner animate-spin text-4xl">🍕</div>
        <p>Finding the perfect chefs for you...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-banner text-red-500 text-center p-4">{error}</div>
    );

  if (filteredRecommendedChefs.length === 0) {
    return null; // Don't show the section if no recommended chefs match filters
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended For You</h2>
      <div className="chef-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRecommendedChefs.map((chef) => (
          <SingleChefCard
            key={chef._id}
            chefId={chef._id}
            chefPhotoPath={chef.img}
            chefName={chef.name}
            chefLocation={chef.location}
            chefSpecialty={chef.specialty}
            minimumOrder={chef.minimumOrder}
            highlightText={searchQuery}
            isRecommended={true}
          />
        ))}
      </div>
    </div>
  );
}

export default RecommendedChefs;