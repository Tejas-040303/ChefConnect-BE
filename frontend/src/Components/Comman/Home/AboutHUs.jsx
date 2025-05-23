import React from 'react';
import { Link } from 'react-router-dom';

function AboutHUs() {
    return (
        <section className="bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-6">
                    About <span className="text-orange-600">ChefConnect</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed text-justify">
                    At ChefConnect, we bridge the gap between culinary enthusiasts and professional chefs. Explore the world of flavors, learn from the masters, and share your love for cooking with like-minded individuals. Our mission is to make gourmet experiences accessible to everyone while fostering a global community of food lovers.
                </p>
                <Link
                    to="/about"
                    className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full px-8 py-3 font-semibold hover:from-orange-500 hover:to-orange-700 transition-all"
                >
                    Know More →
                </Link>
            </div>
        </section>
    );
}

export default AboutHUs;