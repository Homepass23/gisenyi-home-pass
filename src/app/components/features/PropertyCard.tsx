'use client'

import Image from 'next/image'
import { FaBed, FaBath } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTopRatedAccommodations, QueryAccommodation } from '../../../lib/queryHelpers'
import { getFirstValidImage } from '../../../lib/imageHelpers'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  title: string
  image: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
  rating: number
}

const PropertyCard = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'rooms' | 'houses'>('all')

  // Fetch top-rated accommodations from Supabase with React Query
  const { data: accommodations, isLoading, error } = useQuery<QueryAccommodation[]>({
    queryKey: ['top-rated-accommodations'],
    queryFn: () => fetchTopRatedAccommodations(10), // Fetch 10 to filter down to 4
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Log any errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Error fetching top-rated accommodations:', error);
    }
  }, [error]);

  // Filter accommodations based on type
  const filteredAccommodations = accommodations?.filter(acc => {
    if (filter === 'all') return true
    if (filter === 'rooms') return acc.type === 'room'
    if (filter === 'houses') return acc.type === 'entire'
    return true
  }) || []

  // Take only the top 4 after filtering
  const topProperties = filteredAccommodations.slice(0, 4)

  // Transform QueryAccommodation to Property type for display
  const properties: Property[] = topProperties.map(acc => ({
    id: acc.id,
    title: acc.title,
    image: getFirstValidImage(acc.image_urls),
    location: acc.location,
    price: `Rwf${acc.price_per_night.toLocaleString()}`,
    bedrooms: acc.room_count || 0,
    bathrooms: acc.bathroom_count || 0,
    rating: acc.rating
  }))

  if (isLoading) {
    return (
      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className='w-full max-w-6xl mx-auto text-center'>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Our guests&apos; favorites</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button className="text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base">
                All
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Rooms
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Houses
              </button>
            </div>
          </div>
          <div className="text-center py-10">Loading properties...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className='w-full max-w-6xl mx-auto text-center'>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Our guests&apos; favorites</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button className="text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base">
                All
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Rooms
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Houses
              </button>
            </div>
          </div>
          <div className="text-center py-10 text-red-500">
            Error loading properties: {error.message || 'Unknown error'}
          </div>
        </div>
      </section>
    )
  }

  // Handle case where no accommodations are found
  if (!accommodations || accommodations.length === 0) {
    return (
      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className='w-full max-w-6xl mx-auto text-center'>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Our guests&apos; favorites</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button className="text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base">
                All
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Rooms
              </button>
              <button className='text-white py-2 px-4 sm:px-6 md:px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition text-sm sm:text-base'>
                Houses
              </button>
            </div>
          </div>
          <div className="text-center py-10 text-gray-500">
            No properties found. Please check back later.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className='w-full max-w-6xl mx-auto text-center'>
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Our guests&apos; favorites</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button 
              className={`py-2 px-4 sm:px-6 md:px-8 font-semibold rounded-md transition text-sm sm:text-base ${
                filter === 'all' 
                  ? 'text-white bg-sky-600 hover:bg-sky-900' 
                  : 'text-sky-600 bg-white hover:bg-gray-100 border border-sky-600'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`py-2 px-4 sm:px-6 md:px-8 font-semibold rounded-md transition text-sm sm:text-base ${
                filter === 'rooms' 
                  ? 'text-white bg-sky-600 hover:bg-sky-900' 
                  : 'text-sky-600 bg-white hover:bg-gray-100 border border-sky-600'
              }`}
              onClick={() => setFilter('rooms')}
            >
              Rooms
            </button>
            <button 
              className={`py-2 px-4 sm:px-6 md:px-8 font-semibold rounded-md transition text-sm sm:text-base ${
                filter === 'houses' 
                  ? 'text-white bg-sky-600 hover:bg-sky-900' 
                  : 'text-sky-600 bg-white hover:bg-gray-100 border border-sky-600'
              }`}
              onClick={() => setFilter('houses')}
            >
              Houses
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/roomDetails?id=${property.id}`)}
            >
              {/* Image & Badge */}
              <div className="relative h-48 sm:h-56 w-full">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to default image if the image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/cozy.jpg';
                  }}
                />
                <span className="absolute top-3 left-3 bg-slate-100 text-black text-xs font-bold px-3 py-1 rounded">
                  📍 {property.location}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">{property.title}</h3>

                {/* Features */}
                <div className="border-b pb-2 flex flex-wrap gap-2 text-xs text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <FaBed className="text-gray-500" /> {property.bedrooms} Bedrooms
                  </div>
                  <div className="flex items-center gap-1">
                    <FaBath className="text-gray-500" /> {property.bathrooms} Bathrooms
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between font-bold items-center text-xs sm:text-sm text-gray-900">
                  <span>{property.price}/night</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                    ★ {property.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PropertyCard