import React from 'react';
import Hero from '../CommanComponents/Home/Hero';
import About from '../CommanComponents/Home/About';
import Service from '../CommanComponents/Common/Service';
import Chef from '../CommanComponents/Home/Chef';
import Review from '../CommanComponents/Home/Review';
import SubmitReview from '../CommanComponents/Home/SubmitReview';
import { slides } from "../data/topChefData.json";
import { reviews } from "../data/reviewData.json";
function Home() {
    return ( 
        <>
            <Hero/>
            <About/>
            <Service/>
            <Chef data={slides} />
            <Review data={reviews} />
            <SubmitReview/>
        </>
     );
}

export default Home;