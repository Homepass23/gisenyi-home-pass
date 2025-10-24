"use client";

import { Send } from "lucide-react";

export default function Newsletter() {
  return (
    <section
      className="relative bg-cover bg-center py-12 sm:py-16 md:py-20"
      style={{
        backgroundImage: "url('/images/imbere.jpg')", // replace with your bg image
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-sky-950/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          SUBSCRIBE TO OUR NEWSLETTER
        </h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg">
          Subscribe to our newsletter to receive exclusive offers
        </p>

        {/* Input */}
        <div className="flex flex-col sm:flex-row items-center bg-white rounded-full overflow-hidden shadow-lg mb-4">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-gray-700 outline-none rounded-l-full text-sm sm:text-base"
          />
          <button className="bg-sky-400 p-3 sm:p-4 rounded-full flex items-center justify-center hover:bg-yellow-500 transition w-full sm:w-auto">
            <Send className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-200">
          <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 rounded" />
          <span>I have read and agree to the terms &amp; conditions</span>
        </label>
      </div>
    </section>
  );
}
