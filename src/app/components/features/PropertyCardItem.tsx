'use client'

import Image from 'next/image'
import { FaBed, FaBath } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { getFirstValidImage } from '../../../lib/imageHelpers'

interface Property {
  id: string
  title: string
  image: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
  rating: number
}

interface PropertyCardItemProps {
  property: Property
  onClick?: () => void // Optional custom click handler
}

const PropertyCardItem = ({ property, onClick }: PropertyCardItemProps) => {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Use custom onClick if provided, otherwise use default routing
    if (onClick) {
      onClick()
    } else {
      router.push(`/roomDetails?id=${property.id}`)
    }
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* Image & Badge */}
      <div className="relative h-56 w-full">
        <Image
          src={getFirstValidImage([property.image])}
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
      <div className="p-5">
        <h3 className="text-lg font-semibold text-black mb-4">{property.title}</h3>

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
        <div className="flex justify-between font-bold items-center text-sm text-gray-900">
          <span>{property.price}/night</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
            ★ {property.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PropertyCardItem