'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FiChevronDown } from 'react-icons/fi'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'How do I book a room?',
    answer:
      'Select your preferred dates, choose a room type, and complete the booking form. You’ll receive a confirmation once the reservation is successful.',
  },
  {
    question: 'What payment methods are accepted for booking?',
    answer:
      'We accept major credit/debit cards, bank transfers, and mobile money depending on your region.',
  },
  {
    question: 'Can I cancel or modify my booking?',
    answer:
      'Yes. You can cancel or change your reservation up to 48 hours before check-in without penalty. After that, cancellation fees may apply.',
  },
  {
    question: 'Is my online booking secure?',
    answer:
      'Absolutely. We use end-to-end SSL encryption to protect your personal and payment information throughout the booking process.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20 bg-white text-black">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold relative inline-block">
            Frequently Asked Questions
        </h2>
      </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Left Image */}
        <div className="relative rounded-xl w-full h-48 sm:h-64 md:h-80 lg:h-[390px] order-2 lg:order-1">
          <Image
            src="/images/cozyed.jpg" // Replace with your image path
            alt="FAQ Image"
            fill
            className="object-cover rounded-md"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>
        {/* FAQ list */}
        <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-gray-900 font-medium hover:bg-gray-100 focus:outline-none transition text-sm sm:text-base"
              >
                <span className="pr-2">{faq.question}</span>
                <FiChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`px-4 sm:px-6 pb-3 sm:pb-4 text-gray-700 text-xs sm:text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
    </section>
  )
}

export default FaqSection
