'use client'

import Image from 'next/image'
import { FaStar } from 'react-icons/fa'

type Testimonial = {
  name: string
  message: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Jessica',
    message:
      'The location was perfect, and the room was cozy and comfortable. The host was very welcoming and made sure I had everything I needed.',
    avatar: '/images/me.jpg',
  },
  {
    name: 'Miguel',
    message:
      'The room was clean and comfortable. The location was ideal for exploring Miami, and I would definitely stay here again.',
    avatar: '/images/me.jpg',
  },
  {
    name: 'Jenny',
    message:
      'I had a wonderful stay at the homestay. The room was spacious and comfortable, and the location was perfect.',
    avatar: '/images/me.jpg',
  },
  {
    name: 'Edwards',
    message:
      'The room was clean and comfortable. The location was ideal for exploring Miami, and I would definitely stay here again.',
    avatar: '/images/me.jpg',
  },
  {
    name: 'Lawrence M',
    message:
      "The homestay was the perfect place to stay for my trip to Miami. The room was clean and comfortable. The location was great – I was able to walk to many of the city's top attractions.",
    avatar: '/images/me.jpg',
  },
  {
    name: 'Darlene',
    message:
      'The room was clean and comfortable. The location was ideal for exploring Miami, and I would definitely stay here again.',
    avatar: '/images/me.jpg',
  },
]

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500 mb-2">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">What our guests are saying</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="border border-gray-200 p-4 sm:p-6 rounded-md shadow-sm bg-white flex flex-col justify-between"
            >
              {/* Stars */}
              <div className="flex items-center text-sky-500 mb-3 sm:mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className="w-3 h-3 sm:w-4 sm:h-4" />
                ))}
              </div>

              {/* Message */}
              <p className="text-gray-700 text-xs sm:text-sm flex-grow leading-relaxed">{t.message}</p>

              {/* Avatar & name */}
              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 relative rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="font-bold italic text-xs sm:text-sm">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
