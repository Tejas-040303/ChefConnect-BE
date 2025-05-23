import React, { useState } from "react";
import Select from "react-select";
import { FaRupeeSign } from "react-icons/fa";

function SidePanel({ onFilterChange }) {
  const [filters, setFilters] = useState({
    rating: "",
    priceRange: [0, 1000],
    location: "",
    specialties: [],
    dietaryPreferences: [],
    allergies: [],
  });

  // Options for the multi-select components
  const specialtiesOptions = [
    { value: "Indian", label: "Indian" },
    { value: "Mexican", label: "Mexican" },
    { value: "Italian", label: "Italian" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Mediterranean", label: "Mediterranean" },
    { value: "French", label: "French" },
    { value: "Thai", label: "Thai" },
    { value: "Spanish", label: "Spanish" },
    { value: "American", label: "American" },
    { value: "Korean", label: "Korean" },
  ];

  const dietaryPreferencesOptions = [
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Gluten-Free", label: "Gluten-Free" },
    { value: "Keto", label: "Keto" },
    { value: "Paleo", label: "Paleo" },
    { value: "Low-Carb", label: "Low-Carb" },
    { value: "Dairy-Free", label: "Dairy-Free" },
    { value: "Sugar-Free", label: "Sugar-Free" },
  ];

  const allergiesOptions = [
    { value: "Nuts", label: "Nuts" },
    { value: "Dairy", label: "Dairy" },
    { value: "Eggs", label: "Eggs" },
    { value: "Gluten", label: "Gluten" },
    { value: "Shellfish", label: "Shellfish" },
    { value: "Soy", label: "Soy" },
    { value: "Fish", label: "Fish" },
    { value: "Wheat", label: "Wheat" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = {
      rating: "",
      priceRange: [0, 1000],
      location: "",
      specialties: [],
      dietaryPreferences: [],
      allergies: [],
    };
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      borderColor: '#f3f4f6',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#f59e0b'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#fcd34d',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#78350f',
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#78350f',
      '&:hover': {
        backgroundColor: '#f59e0b',
        color: 'white',
      },
    }),
  };

  return (
    <div className="bg-gradient-to-b from-amber-400 to-amber-500 text-white p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm h-[90vh]">
      <h2 className="text-2xl font-bold mb-6 text-amber-900 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Filter Options
      </h2>

      <div className="space-y-6 pr-2 overflow-y-auto max-h-[75vh] pb-4">
        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block mb-2 text-amber-900 font-medium">
            Rating:
          </label>
          <select
            id="rating"
            className="w-full p-3 rounded-lg bg-white/80 text-amber-900 focus:ring-2 focus:ring-amber-500 border-none outline-none"
            value={filters.rating}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="5">★★★★★ (5 Stars)</option>
            <option value="4">★★★★☆ (4+ Stars)</option>
            <option value="3">★★★☆☆ (3+ Stars)</option>
            <option value="2">★★☆☆☆ (2+ Stars)</option>
            <option value="1">★☆☆☆☆ (1+ Star)</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block mb-2 text-amber-900 font-medium">
            Price Range: <span className="font-bold"><FaRupeeSign className="inline text-sm" />{filters.priceRange[1]}</span>
          </label>
          <input
            type="range"
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/80"
            min="0"
            max="1000"
            step="50"
            value={filters.priceRange[1]}
            onChange={(e) => handleFilterChange("priceRange", [0, Number(e.target.value)])}
          />
          <div className="flex justify-between text-xs mt-1 text-amber-900">
            <span><FaRupeeSign className="inline text-sm" />0</span>
            <span><FaRupeeSign className="inline text-sm" />250</span>
            <span><FaRupeeSign className="inline text-sm" />500</span>
            <span><FaRupeeSign className="inline text-sm" />750</span>
            <span><FaRupeeSign className="inline text-sm" />1000</span>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block mb-2 text-amber-900 font-medium">
            Location:
          </label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-3.5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              type="text"
              id="location"
              className="w-full p-3 pl-10 rounded-lg bg-white/80 text-amber-900 focus:ring-2 focus:ring-amber-500 border-none outline-none"
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
        </div>

        {/* Specialties Filter */}
        <div>
          <label htmlFor="specialties" className="block mb-2 text-amber-900 font-medium">
            Specialties:
          </label>
          <Select
            id="specialties"
            isMulti
            options={specialtiesOptions}
            value={specialtiesOptions.filter((option) => filters.specialties.includes(option.value))}
            onChange={(selectedOptions) =>
              handleFilterChange("specialties", selectedOptions ? selectedOptions.map((opt) => opt.value) : [])
            }
            placeholder="Select cuisine specialties"
            styles={customSelectStyles}
            className="text-amber-900"
          />
        </div>

        {/* Apply and Reset buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-md flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="py-3 px-4 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors shadow-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidePanel;