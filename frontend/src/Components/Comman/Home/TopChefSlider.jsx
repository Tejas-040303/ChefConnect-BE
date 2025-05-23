import React, { useState, useEffect } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";

function TopChefSlider({ data }) {
  const [startIndex, setStartIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);

  // Ensure data is an array, default to empty array if not
  const safeData = Array.isArray(data) ? data : [];

  // Responsive slides configuration
  useEffect(() => {
    const updateSlides = () => {
      const width = window.innerWidth;
      setSlidesToShow(
        width <= 640 ? 1 : // sm
        width <= 768 ? 2 : // md
        width <= 1024 ? 3 : // lg
        4 // xl
      );
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  // Navigation handlers
  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1 >= safeData.length ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 < 0 ? safeData.length - 1 : prev - 1));
  };

  // Auto-slide functionality (only if there are slides)
  useEffect(() => {
    if (safeData.length > 0) {
      const interval = setInterval(nextSlide, 3000);
      return () => clearInterval(interval);
    }
  }, [safeData.length]); // Depend on safeData.length to re-run if data changes

  // Calculate visible slides
  const visibleSlides = safeData.length > 0
    ? safeData
        .slice(startIndex, startIndex + slidesToShow)
        .concat(
          startIndex + slidesToShow > safeData.length
            ? safeData.slice(0, startIndex + slidesToShow - safeData.length)
            : []
        )
    : [];

  return (
    <section className="bg-gradient-to-b from-orange-100 via-orange-100 to-orange-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-8">
          Our Top Chefs
        </h2>
        
        <div className="relative">
          <button 
            onClick={prevSlide}
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 text-orange-500 hover:text-orange-600 transition-colors"
            aria-label="Previous slide"
            disabled={safeData.length === 0}
          >
            <BsArrowLeftCircleFill className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>

          <div className="overflow-hidden">
            {safeData.length === 0 ? (
              <p className="text-center text-orange-500">No chefs available</p>
            ) : (
              <div className="flex gap-8 sm:gap-14 transition-transform duration-300 ease-in-out ml-16">
                {visibleSlides.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={item.src} 
                        alt={item.alt} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-orange-500">
                          Chef {item.alt.split(" ")[1]}
                        </h3>
                        <p className="text-yellow-500 mt-1">
                          ⭐ 4.{Math.floor(Math.random() * 9) + 1}
                        </p>
                        <p className="text-orange-500 mt-2 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={nextSlide}
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 text-orange-500 hover:text-orange-600 transition-colors"
            aria-label="Next slide"
            disabled={safeData.length === 0}
          >
            <BsArrowRightCircleFill className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default TopChefSlider;