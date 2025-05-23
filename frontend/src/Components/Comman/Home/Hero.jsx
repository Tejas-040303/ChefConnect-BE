import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import heroImage from "../../../assets/heroJPG.png";

function Hero() {
    return (
        <section className="bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row-reverse items-center justify-center max-w-5xl mx-auto">
                {/* Image Section (Right Side on Large Screens) */}
                <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
                    <img
                        src={heroImage}
                        alt="Images of Chefs"
                        className="w-full h-auto object-cover"
                    />
                </div>
                {/* Text and Buttons Section (Left Side on Large Screens) */}
                <div className="w-full lg:w-1/2 p-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 text-center lg:text-left mb-4">
                        Welcome to <span className="text-orange-600">ChefConnect</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-700 text-center lg:text-left mb-6">
                        Discover a world of culinary delights! Connect with professional chefs, explore global recipes, and bring your cooking skills to the next level. Your journey to mastering the art of cooking starts here.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            to="/signup" // Navigate to Signup page
                            className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full px-6 py-2 font-semibold hover:from-orange-500 hover:to-orange-700 transition-all"
                        >
                            Discover Chefs →
                        </Link>
                        <Link
                            to="/signup" // Navigate to Signup page
                            className="bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-semibold hover:bg-gray-300 transition-all"
                        >
                            Connect with Us →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;