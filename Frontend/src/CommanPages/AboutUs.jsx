import React from 'react';
import Hero from '../CommanComponents/About/Hero'
import Service from '../CommanComponents/Common/Service'
import Team from '../CommanComponents/About/Team';
function AboutUs() {
    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">About Us</h2>
            <Hero/>
            <Service />

            <h3 className='text-center'>Our Team</h3>
            <Team/>

        </div>
    );
}

export default AboutUs;