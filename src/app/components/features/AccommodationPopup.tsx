'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTopRatedAccommodations, QueryAccommodation } from '../../../lib/queryHelpers'
import { getFirstValidImage } from '../../../lib/imageHelpers'
import { useRouter } from 'next/navigation'
import { FaBed, FaBath } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type Property = {
  id: string
  title: string
  image: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
  rating: number
  // Add type to distinguish between accommodations and rooms
  type: 'accommodation' | 'room'
  accommodationId?: string // For rooms, link to parent accommodation
}

interface AccommodationPopupProps {
  onClose: () => void
}

const AccommodationPopup = ({ onClose }: AccommodationPopupProps) => {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'rooms' | 'houses'>('all')

  const { data: accommodations, isLoading, error } = useQuery<QueryAccommodation[]>({
    queryKey: ['available-accommodations'],
    queryFn: () => fetchTopRatedAccommodations(8),
    staleTime: 5 * 60 * 1000,
  })

  const filterOptions = ['all', 'rooms', 'houses'] as const
  type FilterType = typeof filterOptions[number]

  // Filter accommodations based on type
  const filteredAccommodations = accommodations?.filter(acc => {
    if (filter === 'all') return true
    if (filter === 'rooms') return acc.type === 'room' // Show only room type accommodations
    if (filter === 'houses') return acc.type === 'entire' // Show only entire place accommodations
    return true
  }) || []

  const accommodationProperties: Property[] = filteredAccommodations.map(acc => ({
    id: acc.id,
    title: acc.title,
    image: getFirstValidImage(acc.image_urls),
    location: acc.location,
    price: `Rwf${acc.price_per_night.toLocaleString()}`,
    bedrooms: acc.room_count || 0,
    bathrooms: acc.bathroom_count || 0,
    rating: acc.rating,
    type: 'accommodation'
  }))

  // Only show accommodations, not independently booked rooms
  const allProperties = [...accommodationProperties]

  // Apply filter to properties (this is redundant now but kept for clarity)
  const filteredProperties = allProperties

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handlePropertyClick = (property: Property) => {
    onClose()
    // For accommodations, go to the accommodation details page
    router.push(`/roomDetails?id=${property.id}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="popup"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-[100] p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl max-w-6xl w-full shadow-2xl border border-white/40 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg p-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Available Accommodations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <IoClose size={26} />
            </button>
          </div>

          {/* Filter */}
          <div className="flex-shrink-0 p-4 sm:p-6 flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100/60 p-1 rounded-full">
              {filterOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as FilterType)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200
                    ${filter === type
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-sky-700'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Accommodation Grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            {isLoading ? (
              <div className="text-center py-10 text-gray-600">
                Loading available accommodations...
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                Error loading accommodations. Please try again later.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/80 backdrop-blur-md rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                      <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/cozy.jpg'
                        }}
                      />
                      <span className="absolute top-3 left-3 bg-white/80 text-gray-900 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                        📍 {property.location}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 border-b pb-2 mb-2">
                        <div className="flex items-center gap-1">
                          <FaBed /> {property.bedrooms} Beds
                        </div>
                        <div className="flex items-center gap-1">
                          <FaBath /> {property.bathrooms} Baths
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
                        <span>{property.price}/night</span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                          ★ {property.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg p-4 border-t border-gray-200 text-center rounded-b-2xl">
            <button
              onClick={() => {
                onClose()
                router.push('/accommodations')
              }}
              className="text-sky-700 hover:text-sky-900 font-medium transition-colors"
            >
              View All Accommodations
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AccommodationPopup