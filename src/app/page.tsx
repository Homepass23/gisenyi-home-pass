// app/page.tsx or app/(home)/page.tsx


import HeroSection from './components/HeroSection'
import React from 'react'
import PropertyCard from './components/PropertyCard'
import TestimonialsSection from './components/Testimonials'
import FaqSection from './components/faq'
import WhyChooseUs from './components/whychooseus'
import Newsletter from './components/newsletter'
import Gallery from './components/gallery'

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background image handled by layout */}
      <HeroSection />
      <PropertyCard />
      <WhyChooseUs />
      <TestimonialsSection />
      <Gallery />
      <FaqSection />
      <Newsletter />
    </div>
  )
}
