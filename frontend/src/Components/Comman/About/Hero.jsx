import React from 'react';
import AboutUsHero from '../../../assets/AboutUsHero.png';

function Hero() {
  return (
    <section className="bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 min-h-[70vh] flex items-center py-12 px-14 ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text Section */}
          <div className="space-y-6">
            <h1 className="text-2
            xl md:text-5xl font-bold text-orange-400">
              About <span className="text-orange-600">ChefConnect</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              At ChefConnect, we bridge the gap between culinary enthusiasts and professional chefs. Explore the world of flavors, learn from the masters, and share your love for cooking with like-minded individuals. Our mission is to make gourmet experiences accessible to everyone while fostering a global community of food lovers.
            </p>
          </div>
          {/* Image Section */}
          <div className="flex justify-center">
            <img
              src={AboutUsHero}
              alt="ChefConnect Hero"
              className="w-full max-w-md rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;