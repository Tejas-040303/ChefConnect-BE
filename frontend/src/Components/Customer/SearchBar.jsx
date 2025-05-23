import React, { useState } from 'react';

function SearchBar({ setCurrentView, onSearch }) {
  const [activeButton, setActiveButton] = useState('singleChef');
  const [searchTerm, setSearchTerm] = useState('');

  const handleButtonClick = (view) => {
    setActiveButton(view);
    setCurrentView(view);
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    onSearch(searchTerm);
  };
  
  const handleKeyDown = (e) => {
    // Trigger search on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchTerm);
    }
  };

  return (
    <div className="search-container bg-amber-400 p-4 flex justify-between items-center rounded-lg shadow-lg">
      <div className="chef-buttons flex space-x-4">
        <button
          className={`chef-button px-4 py-2 rounded-lg text-white ${
            activeButton === 'singleChef' ? 'bg-amber-600' : 'bg-amber-500 hover:bg-amber-600'
          } transition-all duration-200`}
          type="button"
          onClick={() => handleButtonClick('singleChef')}>
          Single Chef
        </button>
        <button
          className={`chef-button px-4 py-2 rounded-lg text-white ${
            activeButton === 'chefCollaboration' ? 'bg-amber-600' : 'bg-amber-500 hover:bg-amber-600'
          } transition-all duration-200`}
          type="button"
          onClick={() => handleButtonClick('chefCollaboration')}>
          Chef Collaboration
        </button>
      </div>
      <form onSubmit={handleSearch} className="search-box flex items-center">
        <input
          className="search-input p-2 rounded-l-lg bg-gray-100 text-black focus:ring-2 focus:ring-amber-500 w-64"
          type="search"
          placeholder="Search by chef name, specialty, or location..."
          aria-label="Search by chef name, specialty, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          type="submit"
          className="search-button bg-amber-500 text-white px-4 py-2 rounded-r-lg hover:bg-amber-600 transition-all duration-200">
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;