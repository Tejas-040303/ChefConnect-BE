import React from 'react';
import ContactUs from "../../Components/Comman/Contact/ContactUs";

function Contact() {
  return (
    <section className="py-6 pb-14 bg-orange-100">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-4 text-orange-500 font-bold text-3xl sm:text-4xl">
          Contact Us
        </h2>
        <ContactUs />
      </div>
    </section>
  );
}

export default Contact;