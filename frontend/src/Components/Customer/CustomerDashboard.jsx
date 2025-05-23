import React, { useState, useEffect } from "react";
import SidePanel from "./SidePannel";
import SearchBar from "./SearchBar";
import SingleChefContainer from "./SingleChefContainer";
import MuiltChefContainer from "./MuiltChefContainer";
import { FaPizzaSlice, FaCarrot, FaAppleAlt } from "react-icons/fa";
import { GiCupcake, GiFrenchFries, GiNoodles } from "react-icons/gi";

function DashBoard() {
  const [currentView, setCurrentView] = useState("default");
  const [foodIcons, setFoodIcons] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const icons = Array(15)
      .fill()
      .map((_, i) => {
        const iconList = [
          FaPizzaSlice,
          FaCarrot,
          FaAppleAlt,
          GiCupcake,
          GiFrenchFries,
          GiNoodles,
        ];
        const RandomIcon = iconList[Math.floor(Math.random() * iconList.length)];
        return {
          id: i,
          Icon: RandomIcon,
          size: Math.random() * 2.5 + 2,
          left: `${Math.random() * 90 + 5}%`,
          top: `${Math.random() * 80 + 10}%`,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.35 + 0.05,
        };
      });
    setFoodIcons(icons);
  }, []);

  const handleSearch = (term) => {
    setSearchQuery(term);
    if (currentView !== "singleChef") {
      setCurrentView("singleChef");
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (searchQuery) {
      setSearchQuery("");
    }
  };

  return (
    <div className="h-screen flex text-black relative overflow-y-scroll">
  
      {/* Food icons animation */}
      {foodIcons.map((item) => (
        <div
          key={item.id}
          className="absolute text-white animate-float -z-5"
          style={{
            left: item.left,
            top: item.top,
            opacity: item.opacity,
            animation: `float ${item.duration}s infinite linear`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.size}rem`,
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
          }}
        >
          <item.Icon />
        </div>
      ))}
      
      <div className="flex-1 relative p-6">
        <div className="grid grid-cols-4 gap-6 h-full">
          {/* Side Panel */}
          <div className="col-span-1 overflow-y-auto">
            <SidePanel
              onFilterChange={(filters) => setAppliedFilters(filters)}
            />
          </div>
          
          {/* Main Content */}
          <div className="col-span-3 flex flex-col h-full">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                setCurrentView={handleViewChange}
                onSearch={handleSearch}
              />
            </div>
            
            {/* Content Area with glass effect */}
            <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-white mb-32 rounded-2xl shadow-xl border border-white/20">
              {currentView === "default" && (
                <SingleChefContainer
                  appliedFilters={appliedFilters}
                  searchQuery={searchQuery}
                  showRecommendationsFirst={true}
                />
              )}
              {currentView === "singleChef" && (
                <SingleChefContainer
                  appliedFilters={appliedFilters}
                  searchQuery={searchQuery}
                  showRecommendationsFirst={false}
                />
              )}
              {currentView === "chefCollaboration" && <MuiltChefContainer />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Improved animation keyframes */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-120px) rotate(180deg);
          }
          100% {
            transform: translateY(-240px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default DashBoard;