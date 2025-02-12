import React, { useState } from 'react';
import Select from 'react-select'; // Install react-select via npm
import '../../../public/css/CustomerCss/SidePanel.css'; // Add your styling here

function SidePanel({ onFilterChange }) {
    const [filters, setFilters] = useState({
        rating: '',
        priceRange: [0, 1000],
        location: '',
        specialties: [],
    });

    // Changed/Removed
    const specialtiesOptions = [
        { value: 'Chinese', label: 'Chinese' },
        { value: 'Italian', label: 'Italian' },
        { value: 'Indian', label: 'Indian' },
        { value: 'Mexican', label: 'Mexican' },
    ];

    const handleFilterChange = (key, value) => {
        const updatedFilters = { ...filters, [key]: value };
        setFilters(updatedFilters);
        if (onFilterChange) onFilterChange(updatedFilters); // Pass filters to parent
    };

    return (
        <div className="side-panel">
            <h2>Filter Options</h2>

            {/* Rating Filter */}
            <div className="filter-section">
                <label htmlFor="rating">Rating:</label>
                <select
                    id="rating"
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
                <label>Price Range:</label>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                        handleFilterChange('priceRange', [0, Number(e.target.value)])
                    }
                />
                <p>
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </p>
            </div>

            {/* Location Filter */}
            <div className="filter-section">
                <label htmlFor="location">Location:</label>
                <input
                    type="text"
                    id="location"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                />
            </div>

            {/* Specialties Filter */}
            <div className="filter-section">
                <label htmlFor="specialties">Specialties:</label>
                <Select
                    id="specialties"
                    isMulti // Allows selecting multiple options
                    options={specialtiesOptions} // Provide the options array
                    value={filters.specialties} // Sync selected values with state
                    onChange={(selectedOptions) => {
                        handleFilterChange(
                            'specialties',
                            selectedOptions ? selectedOptions.map((opt) => opt.value) : []
                        );
                    }}
                    placeholder="Select specialties"
                />
            </div>
        </div>
    );
}

export default SidePanel;
