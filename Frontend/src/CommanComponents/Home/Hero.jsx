import React from 'react';
import '../../../public/css/CommanCss/Hero.css';

function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        Welcome to <span className="highlight">ChefConnect</span>
                    </h1>
                    <p className="hero-description">
                        Discover a world of culinary delights! Connect with professional chefs, explore global recipes, and bring your cooking skills to the next level. Your journey to mastering the art of cooking starts here.
                    </p>
                    <div className="hero-buttons">
                        <a href="#" className="hero-btn primary-btn">
                            <span>Discover Chefs &rarr;</span>
                            
                        </a>
                        <a href="#" className="hero-btn secondary-btn">
                            <span>Connect with Us &rarr;</span>
                            
                        </a>
                    </div>
                </div>
                <div className="hero-image-container">
                    <img
                        src="/heroPNG.png"
                        alt="Images of Chefs"
                        className="hero-image"
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;