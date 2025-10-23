"use client";

import { CheckCircle } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section
      className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[750px] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('/images/poche.jpg')", // replace with your background image path
      }}
    >
      <div className="bg-sky-950/60 w-full h-full absolute top-0 left-0" />
      <div className="relative max-w-4xl h-full px-4 sm:px-6 md:px-8 mx-auto flex flex-col justify-center py-12 sm:py-16 md:py-20 text-white">
        <p className="text-sky-200 font-semibold uppercase tracking-wide text-sm sm:text-base">
          Features
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-3 sm:mt-4 md:mt-5 mb-6 sm:mb-8">Why Choose Us</h2>
        <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 italic max-w-xl leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
          tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
        </p>

        <ul className="space-y-3 sm:space-y-4">
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-semibold">Trusted Company</span>
          </li>
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-semibold">Transparent Pricing</span>
          </li>
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-semibold">Professional Support</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
