import React from 'react';
import PremiumCard from '../../Components/Comman/Premium/PremiumCard';

function Premium() {
  return (
    <section className="py-12 bg-orange-100">
      <div className="container mx-auto px-4">
        <h2 className="text-center my-4 text-orange-500 font-bold text-3xl sm:text-4xl">
          Premium Membership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Free / Bronze Plan */}
          <div className="col-span-1">
            <PremiumCard
              PlanName="Bronze (Free)"
              Price="0"
              Description={[
                'Access to basic recipes & tutorials',
                'Limited community interactions',
                'Basic chef profile creation',
                'Ads-supported experience',
              ]}
              isHighlighted={true}
            />
          </div>

          {/* Pro / Silver Plan (Larger) */}
          <div className="col-span-1 md:col-span-1">
            <PremiumCard
              PlanName="Silver (Pro)"
              Price="9.99"
              Description={[
                'Unlock exclusive chef tutorials',
                'Advanced recipe analytics',
                'Enhanced community support',
                'Limited access to premium chefs',
              ]}
              isHighlighted={true}
              isLarger={true} // Keeps Silver larger in width
            />
          </div>

          {/* Pro+ / Gold Plan */}
          <div className="col-span-1">
            <PremiumCard
              PlanName="Gold (Pro+)"
              Price="19.99"
              Description={[
                'All Silver Plan features',
                'One-on-one mentoring sessions',
                'Full access to premium chefs',
                'Ad-free experience',
                'Priority customer support',
              ]}
              isHighlighted={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Premium;