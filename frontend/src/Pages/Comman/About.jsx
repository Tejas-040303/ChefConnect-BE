import React from 'react';

import Hero from "../../Components/Comman/About/Hero";
import AboutPageServices from "../../Components/Comman/About/AboutPageServices";
import Team from "../../Components/Comman/About/Team";

function About() {
    return ( 
        <div>
            <Hero/>
            <AboutPageServices/>
            <Team/>  
        </div>
     );
}

export default About;