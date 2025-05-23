import React from 'react';

import ChefBooking from "../../../assets/ChefBooking.png";
import HygienicFood from "../../../assets/HygienicFood.png";
import Collabration from "../../../assets/Collabration.png";
import TrainingChef from "../../../assets/TrainingChef.png";
import Support from "../../../assets/Support.png";

const services = [
    { svgPath: ChefBooking, serviceName: "Chef Booking", glowColor: "#ff4757" },
    { svgPath: HygienicFood, serviceName: "Hygienic Food", glowColor: "#ffdd59" },
    { svgPath: Collabration, serviceName: "Chef Collaboration", glowColor: "#2ed573" },
    { svgPath: TrainingChef, serviceName: "Chef Training", glowColor: "#1e90ff" },
    { svgPath: Support, serviceName: "24/7 Support", glowColor: "#ffa502" },
];
const Services = () => {

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
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Exceptional quality and attention to detail in {service.serviceName}.
                            </p>
                            {/* Glow Effect via CSS (inlined for simplicity, can be moved to a CSS file) */}
                            <style jsx>{`
                                .service-card {
                                    position: relative;
                                    overflow: hidden;
                                    max-width: 300px; /* Limit card width for consistency */
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

export default Services;