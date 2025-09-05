import React from 'react';
import ContactInfo from './shared/contactInfo';
import Message from './shared/message';
import Image from 'next/image';

const ContactSection: React.FC = () => {
  return (
    <section className="text-black py-16">
          {/* Hero */}
              <section className="relative h-[32vh] md:h-[40vh] mb-12 w-full overflow-hidden">
              {/* Background image */}
              <Image
                  src="/images/Room2.1.jpg"                 // put your banner image here
                  alt="Lake Kivu home interior"
                  fill
                  priority
                  className="object-cover object-center scale-105"
              />
      
              {/* Soft white wash to match the screenshot’s faded look */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/80 via-white/40 to-white/70 md:from-white/60 md:via-white/30 md:to-white/60 backdrop-blur-[1px]" />
      
              {/* Title */}
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                  <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 tracking-wide">
                      Contact Us
                  </h1>
                  <div className="mx-auto mt-3 h-[2px] w-12 bg-[#c79c61]" />
                  </div>
              </div>
              </section>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start mb-12">
        {/* Left: Contact Form */}
        <Message />

        {/* Right: Map and Contact Info */}
        <div className="space-y-8">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps?q=-1.69782,29.256276&hl=en&z=16&output=embed"
            width="100%"
            height="520"
            className="rounded-lg border-0"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>


      </div>
      <ContactInfo />
    </section>
  );
};

export default ContactSection;
