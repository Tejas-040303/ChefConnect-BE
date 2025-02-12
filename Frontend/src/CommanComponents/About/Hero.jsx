import React from 'react';

function Hero() {
    return (
        <section className="about-section" style={{ 'background': '#e0a353' }}>
            <div className="hero-container">
                <div className="hero-text">
                    <div className="row">
                        <div className="col-6">
                        <p className="hero-description" style={{textAlign:"justify", marginTop:"40px"}}>
                            Welcome to ChefConnect! Discover the joy of personalized culinary experiences, crafted to suit your taste and preferences.
                            Connect with professional chefs and embark on a delightful journey through diverse cuisines, all from the comfort of your home.
                        </p>
                        </div>
                        <div className="col-6">
                            <img src="../public/AboutUsHero.png" alt="chef-connect-hero-image" className="hero-image" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
export default Hero;