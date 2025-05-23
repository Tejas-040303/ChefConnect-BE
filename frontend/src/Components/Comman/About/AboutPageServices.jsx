import React from 'react';

import ChefBooking from '../../../assets/ChefBooking.png';
import HygienicFood from '../../../assets/HygienicFood.png';
import Collabration from '../../../assets/Collabration.png';
import TrainingChef from '../../../assets/TrainingChef.png';
import Support from '../../../assets/Support.png';

const services = [
  {
    svgPath: ChefBooking,
    serviceName: 'Chef Booking',
    glowColor: '#ff4757',
    description:
      'Book professional chefs for personalized culinary experiences at your convenience. Whether it’s a private dinner, a special event, or a cooking session at home, our chefs bring expertise and creativity to your table, tailored to your preferences and dietary needs.',
  },
  {
    svgPath: HygienicFood,
    serviceName: 'Hygienic Food',
    glowColor: '#ffdd59',
    description:
      'Enjoy meals prepared with the highest standards of hygiene and quality. Our chefs use fresh, premium ingredients and follow strict sanitation protocols to ensure every dish is not only delicious but also safe and wholesome for you and your loved ones.',
  },
  {
    svgPath: Collabration,
    serviceName: 'Chef Collaboration',
    glowColor: '#2ed573',
    description:
      'Foster connections with top chefs and culinary experts through collaborative events and projects. From pop-up dinners to recipe development, this service lets you engage with professionals, share ideas, and create unforgettable gastronomic experiences together.',
  },
  {
    svgPath: TrainingChef,
    serviceName: 'Chef Training',
    glowColor: '#1e90ff',
    description:
      'Learn the art of cooking from seasoned chefs through hands-on training sessions. Perfect for beginners or enthusiasts, our programs cover techniques, recipes, and kitchen skills, empowering you to master cuisines and elevate your culinary prowess.',
  },
  {
    svgPath: Support,
    serviceName: '24/7 Support',
    glowColor: '#ffa502',
    description:
      'Get assistance anytime with our round-the-clock support team. Whether you have questions about bookings, need help with a service, or seek culinary advice, we’re here to ensure your ChefConnect experience is seamless and satisfying, day or night.',
  },
];

const AboutPageServices = () => {
  return (
    <section className="bg-gradient-to-b from-orange-100 via-amber-50 to-orange-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-orange-500 text-center mb-12">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300"
              style={{ '--glow-color': service.glowColor }}
            >
              <img
                src={service.svgPath}
                alt={service.serviceName}
                className="w-16 h-16 mx-auto mb-4 object-contain"
              />
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                {service.serviceName}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                {service.description}
              </p>
              {/* Glow Effect via CSS (removed 'jsx' attribute, using plain style tag) */}
              <style>{`
                .service-card {
                  position: relative;
                  overflow: hidden;
                  max-width: 300px;
                }
                .service-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: var(--glow-color);
                  filter: blur(20px);
                  opacity: 0;
                  transition: opacity 0.3s ease-in-out;
                  z-index: 0;
                }
                .service-card:hover::before {
                  opacity: 0.2;
                }
                .service-card > * {
                  position: relative;
                  z-index: 1;
                }
              `}</style>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPageServices;