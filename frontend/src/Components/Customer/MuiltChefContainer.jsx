import React from 'react';

function MultiChefContainer() {
  const collaborationItems = [
    "Third-party Integration for Easy Grocery Delivery",
    "catering Services for Special Events",
    "Celebrity Chef Collaborations",
    "Seasonal Menu Partnerships",
    "International Cuisine Fusion Events",
    "Interactive Cooking Masterclasses"
  ];
  
  return (
    <div className="text-white p-6 bg-amber-400 rounded-lg">
      
      {/* Scrolling text */}
      <div className="overflow-hidden mt-4 border border-white/70 rounded-lg p-3 bg-amber-600 relative">
        <div className="whitespace-nowrap flex animate-marquee">
          {[1, 2, 3, 4].map((_, index) => (
            <span key={index} className="text-white text-xl mx-8">
              Coming soon in future <span className="text-blue-400">•</span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {collaborationItems.map((item, index) => (
          <div key={index} className="bg-amber-500 p-4 rounded-lg border border-white/80 hover:bg-amber-600 hover:border-yellow-800 transition-colors duration-300">
            <h4 className="text-xl text-white hover:text-amber-600 mb-2">{item}</h4>
            <p className="text-white/90">
              {index === 0 && "Seamlessly order groceries from partnered platforms directly through our app."}
              {index === 1 && "Professional catering services tailored for weddings, parties, and corporate events."}
              {index === 2 && "Exclusive partnerships with renowned chefs bringing signature dishes and techniques."}
              {index === 3 && "Fresh menus that change with the seasons, highlighting local and seasonal ingredients."}
              {index === 4 && "Explore unique combinations of culinary traditions from around the world."}
              {index === 5 && "Learn directly from expert chefs through hands-on collaborative cooking sessions."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tailwind animation
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  
  .animate-marquee {
    animation: marquee 20s linear infinite;
  }
`;
document.head.appendChild(style);

export default MultiChefContainer;