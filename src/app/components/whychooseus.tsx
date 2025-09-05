"use client";

import { CheckCircle } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section
      className="relative h-[750px] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('/images/poche.jpg')", // replace with your background image path
      }}
    >
      <div className="bg-sky-950/60 w-full h-full absolute top-0 left-0" />
      <div className="relative max-w-4xl h-full px-8 mx-auto flex flex-col justify-center py-16 text-white">
        <p className="text-sky-200 font-semibold uppercase tracking-wide">
          Features
        </p>
        <h2 className="text-6xl font-bold mt-5 mb-8">Why Choose Us</h2>
        <p className="text-md mb-8 italic max-w-xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
          tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
        </p>

        <ul className="space-y-4">
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-6 h-6" />
            <span className="text-xl font-semibold">Trusted Company</span>
          </li>
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-6 h-6" />
            <span className="text-xl font-semibold">Transparent Pricing</span>
          </li>
          <li className="flex items-center space-x-3">
            <CheckCircle className="text-sky-200 w-6 h-6" />
            <span className="text-xl font-semibold">Professional Support</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
