'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import SearchBar from './ui/SearchBar'
import type { HeroSlide } from '../../types/hero-slide'

const slides: HeroSlide[] = [
  {
    photo: '/images/sallon.jpg',
    title: 'Gisenyi Home Pass',
    description: 'Muraho! Welcome to Gisenyi Home Pass, your trusted local friend for finding the perfect home away from home. Whether you\'re here for business or adventure, we\'ll connect you with warm, authentic accommodations that make you feel like family from day one.',
  },
  {
    photo: '/images/closet.jpg',
    title: 'Your cozy corner',
    description: 'Karibu!! Looking for a cozy private room with a local touch? At Gisenyi Home Pass, we connect you with warm, authentic accommodations where you\'ll have your own space while experiencing genuine community hospitality in beautiful Gisenyi.',
  },
  {
    photo: '/images/villa.jpg',
    title: 'Private Paradise',
    description: 'At Gisenyi Home Pass, we specialize in connecting travelers with entire homes that offer complete privacy, authentic local character, and all the comforts you need for an unforgettable stay.',
  },
]

const HeroSection = () => {
  const [current, setCurrent] = useState(0)

  // Auto-advance every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden text-white">
      {/* Backgrounds */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          }`}
        >
          <Image
            src={slide.photo}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            onError={(e) => {
              // Fallback to a default image if the image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/images/cozy.jpg';
            }}
          />
          {/* Full background overlay */}
          <div className="absolute inset-0 bg-slate-800/30" />
          {/* Navbar area overlay - more opaque for better visibility */}
          <div className="absolute top-0 left-0 right-0 h-19 bg-slate-800/20" />
        </div>
      ))}

      {/* Slide Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-34 pb-8 transition-all duration-700 ease-in-out">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-2xl font-bold leading-tight mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6">
          {slides[current].title}
        </h1>

        <p className="text-sm sm:text-base md:text-md max-w-2xl mb-4 sm:mb-6 italic text-gray-100 leading-relaxed">
            {slides[current].description}
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Tracker dots */}
      <div className="absolute top-1/2 right-4 sm:right-6 transform -translate-y-1/2 z-10 flex flex-col gap-2 sm:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border-2 ${
              i === current
                ? 'bg-white border-white scale-110'
                : 'border-white/50 bg-white/30 hover:bg-white/70'
            }`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection