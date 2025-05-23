import React, { useEffect, useState } from 'react';
import { GiChefToque } from 'react-icons/gi';
import { FaPizzaSlice, FaCarrot, FaAppleAlt } from 'react-icons/fa';
import { GiCupcake, GiFrenchFries, GiNoodles } from 'react-icons/gi';
import Logo from "../../assets/logo.png"; // Adjust the path as necessary
function Home() {
  const [foodIcons, setFoodIcons] = useState([]);
  
  useEffect(() => {
    // Generate random food icons for the animated background
    const icons = Array(15).fill().map((_, i) => {
      const icons = [FaPizzaSlice, FaCarrot, FaAppleAlt, GiCupcake, GiFrenchFries, GiNoodles];
      const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
      
      return {
        id: i,
        Icon: RandomIcon,
        size: Math.random() * 2.5 + 2, // Increased size between 2-4.5rem
        left: `${Math.random() * 90 + 5}%`, // Position left 5-95%
        top: `${Math.random() * 80 + 10}%`, // Position top 10-90%
        duration: 15 + Math.random() * 20, // Animation duration 15-35s
        delay: Math.random() * 5, // Delay animation start 0-5s
        opacity: Math.random() * 0.35 + 0.05, // Opacity between 0.05-0.4
      };
    });
    
    setFoodIcons(icons);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-white flex flex-col items-center justify-center -m-5 relative overflow-hidden">
      {/* Animated Background Elements */}
      {foodIcons.map((item) => (
        <div
          key={item.id}
          className="absolute text-white animate-float"
          style={{
            left: item.left,
            top: item.top,
            opacity: item.opacity,
            animation: `float ${item.duration}s infinite linear`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.size}rem`,
            transform: 'translateY(0px)',
          }}
        >
          <item.Icon />
        </div>
      ))}

      {/* Chef Illustration */}
      <div className="mb-8 relative z-10">
        <img src={Logo} style={{ width: '200px', height: '200px' }} className="text-8xl text-amber-100 animate-bounce" />
      </div>

      {/* Welcome Message */}
      <h1 className="text-4xl font-bold mb-4 text-center text-zinc-900 drop-shadow-md relative z-10">
        We welcome the Chef to <span className='text-white'>ChefConnect!</span>
      </h1>

      {/* Subtext and Call-to-Action */}
      <p className="text-lg text-center text-zinc-900  max-w-md mb-6 relative z-10">
        Explore your profile, manage your dishes, and grow your culinary business.
      </p>

      {/* Optional Call-to-Action Button */}
      <button
        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg shadow-md transition-all duration-300 relative z-10"
        onClick={() => window.location.href = '/chef/dashboard'} // Example navigation to Dashboard
      >
        Get Started
      </button>

      {/* Add CSS animation */}
      <style jsx>{`
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

export default Home;