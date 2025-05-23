import React from 'react';

function TeamComponent({ pngPath, Name, Designation }) {
  // Fallback image if pngPath is empty
  const defaultImage = 'https://via.placeholder.com/150?text=No+Image';

  return (
    <div className="team-card bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
      <img
        src={pngPath || defaultImage}
        alt={`${Name} - ${Designation}`}
        className="w-48 h-48 mx-auto mb-4 rounded-full object-cover border-2 border-orange-500"
      />
      <h3 className="text-xl font-semibold text-gray-800">{Name}</h3>
      <h5 className="text-sm text-gray-600">{Designation}</h5>
    </div>
  );
}

export default TeamComponent;