import React from 'react';
import Hero from '../../Components/Comman/Home/Hero';
import AboutHUs from '../../Components/Comman/Home/AboutHUs';
import Services from '../../Components/Comman/Home/Services';
import TopChefSlider from '../../Components/Comman/Home/TopChefSlider';
import CustomerReview from '../../Components/Comman/Home/CustomerReview';
import Review from '../../Components/Comman/Home/Review';

import topChefData from '../../data/topChefData.json';
import reviewData from '../../data/reviewData.json';


function Home() {
    const { slides } = topChefData;
    const { reviews} = reviewData
    return ( 
        <div>
            <Hero/>
            <AboutHUs/>
            <Services/>
            <TopChefSlider data={slides}/>
            <CustomerReview data={reviews}/>
            <Review/>
        </div>
    );
}

export default Home;