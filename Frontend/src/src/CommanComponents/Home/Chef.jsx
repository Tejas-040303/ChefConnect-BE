import React, { useState, useEffect } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import "../../../public/css/CommanCss/Chef.css";

function Chef({ data }) {
    const [startIndex, setStartIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(4);

    // Update the number of slides to show based on screen size
    useEffect(() => {
        const updateSlidesToShow = () => {
            if (window.innerWidth <= 770) {
                setSlidesToShow(1); // 1 card for mobile screens
            } else if (window.innerWidth <= 995) {
                setSlidesToShow(2); // 2 cards for small screens
            } else if (window.innerWidth <= 1182) {
                setSlidesToShow(3); // 3 cards for medium screens
            } else {
                setSlidesToShow(4); // Default 4 cards for large screens
            }
        };

        // Set slides to show on load and on resize
        updateSlidesToShow();
        window.addEventListener("resize", updateSlidesToShow);

        return () => window.removeEventListener("resize", updateSlidesToShow);
    }, []);

    // Function to go to the next slide
    const nextSlide = () => {
        setStartIndex((prevIndex) =>
            prevIndex + 1 >= data.length ? 0 : prevIndex + 1
        );
    };

    // Function to go to the previous slide
    const prevSlide = () => {
        setStartIndex((prevIndex) =>
            prevIndex - 1 < 0 ? data.length - 1 : prevIndex - 1
        );
    };

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000); // Auto-slide every 3 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Determine the visible slides
    const visibleSlides = data
        .slice(startIndex, startIndex + slidesToShow)
        .concat(
            startIndex + slidesToShow > data.length
                ? data.slice(0, startIndex + slidesToShow - data.length)
                : []
        );

    return (
        <div className="mt-5">
            <h2 className="text-center">Our Top Chefs</h2>
            <div className="carousel">
                <BsArrowLeftCircleFill onClick={prevSlide} className="arrow arrow-left" />
                <div className="carousel-content">
                    {visibleSlides.map((item, idx) => (
                        <div className="card" key={idx}>
                            <img src={item.src} alt={item.alt} className="card-image" />
                            <div className="card-info">
                                <h3 className="card-title">Chef {item.alt.split(" ")[1]}</h3>
                                <p className="card-rating">⭐ 4.{Math.floor(Math.random() * 9) + 1}</p>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <BsArrowRightCircleFill onClick={nextSlide} className="arrow arrow-right" />
            </div>
        </div>
    );
}

export default Chef;
