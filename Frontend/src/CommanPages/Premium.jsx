import React from 'react';
import PremiumCard from '../CommanComponents/Premium/PremiumCard'
function Premium() {
    return (
        <div className="container my-5">
            <h2 className="text-center my-4">Premium Membership</h2>
            <div className="row">
                <div className="col-6">
                    <PremiumCard PlanName="Basic" Price="Free" Description={["Access to our basic features", "Limited access to premium features", "Limited access to premium features", "Limited access to premium features"]} />
                </div>
                <div className="col-6">
                <PremiumCard PlanName="Basic" Price="Free" Description={["Access to our basic features", "Limited access to premium features", "Limited access to premium features", "Limited access to premium features"]} />
                </div>
            </div>        
        </div>
    );
}

export default Premium;