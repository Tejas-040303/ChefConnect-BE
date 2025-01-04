import React from 'react';
import { Link } from 'react-router-dom';
import '../../../public/css/CommanCss/About.css';

function About() {
    return (
        <section className="about-section" >
            <div className="about-content centered">
                <h2 className="about-title">About <span className="highlight">ChefConnect</span></h2>
                <p className="about-description">
                    At ChefConnect, we bridge the gap between culinary enthusiasts and professional chefs. Explore the world of flavors, learn from the masters, and share your love for cooking with like-minded individuals. Our mission is to make gourmet experiences accessible to everyone while fostering a global community of food lovers.
                </p>
                <Link to="/about-us" className="about-btn">Know More &rarr;</Link>
            </div>
        </section>
    );
}

export default About;