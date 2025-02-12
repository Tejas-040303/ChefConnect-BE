import React from 'react';
import '../../../public/css/CommanCss/Service.css';

const Service = () => {
    const services = [
        { svgPath: "/ChefBooking.png", serviceName: "Chef Booking", glowColor: "#ff4757" },
        { svgPath: "/HygienicFood.png", serviceName: "Hygienic Food", glowColor: "#ffdd59" },
        { svgPath: "/Collabration.png", serviceName: "Chef Collaboration", glowColor: "#2ed573" },
        { svgPath: "/TrainingChef.png", serviceName: "Chef Training", glowColor: "#1e90ff" },
        { svgPath: "/Support.png", serviceName: "24/7 Support", glowColor: "#ffa502" },
    ];

    return (
        <div className="service-section">
            <h2 className="service-heading">Our Services</h2>
            <div className="service-grid">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="service-card"
                        style={{ '--glow-color': service.glowColor }}
                        data-aos="fade-up"
                        data-aos-delay={`${index * 100}`}
                    >
                        <img src={service.svgPath} alt={service.serviceName} className="service-icon" />
                        <h3 className="service-title">{service.serviceName}</h3>
                        <p className="service-description">
                            Exceptional quality and attention to detail in {service.serviceName}.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Service;