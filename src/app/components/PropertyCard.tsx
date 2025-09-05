'use client'

import Image from 'next/image'
import { FaBed, FaBath } from 'react-icons/fa'

type Property = {
  id: number
  title: string
  image: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
}

const properties: Property[] = [
  {
    id: 1,
    title: 'Tulip Ocean View',
    image: '/images/Side.jpg',
    location: 'Majengo',
    price: '$350,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: 2,
    title: 'Java Group Regency',
    image: '/images/room1.jpg',
    location: 'Mumujyi',
    price: '$1,250,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: 3,
    title: 'Royal sky Resident',
    image: '/images/Side1.jpg',
    location: 'Mbugangali',
    price: '$950,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
  id: 4,
    title: 'Tulip Ocean View',
    image: '/images/room2.jpg',
    location: 'Majengo',
    price: '$350,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: 11,
    title: 'Tulip Ocean View',
    image: '/images/Side.jpg',
    location: 'Majengo',
    price: '$350,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: 12,
    title: 'Java Group Regency',
    image: '/images/room1.jpg',
    location: 'Mumujyi',
    price: '$1,250,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
    id: 13,
    title: 'Royal sky Resident',
    image: '/images/Side1.jpg',
    location: 'Mbugangali',
    price: '$950,000',
    bedrooms: 4,
    bathrooms: 2,
  },
  {
  id: 14,
    title: 'Tulip Ocean View',
    image: '/images/room2.jpg',
    location: 'Majengo',
    price: '$350,000',
    bedrooms: 4,
    bathrooms: 2,
  },
]

const PropertyCard = () => {
  return (
    <section className="px-6 py-20 bg-gray-50">
        <div className='w-full max-w-6xl mx-auto text-center'>
            
        <div className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold mb-2">Our guests’ favorites</h2>
            <div className="flex items-center gap-4">
                <button className="text-white py-2 px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition">
                    All
                </button>
                <button className='text-white py-2 px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition'>
                    Rooms
                </button>
                <button className='text-white py-2 px-8 bg-sky-600 hover:bg-sky-900 font-semibold rounded-md transition'>
                    Houses
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {properties.map((property) => (
            <div
                key={property.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
                {/* Image & Badge */}
                <div className="relative h-56 w-full">
                <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    // className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
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
