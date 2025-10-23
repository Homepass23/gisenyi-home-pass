'use client';

import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import AmenityIcon from '../../components/shared/AmenityIcon';
import { QueryAccommodation } from '../../../lib/queryHelpers';
import { getFirstValidImage } from '../../../lib/imageHelpers';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner'; // Add toast import

interface PropertyCardProps {
  property: QueryAccommodation;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const router = useRouter();
  const { user, isCustomer } = useAuth();

  const handleCardClick = () => {
    router.push(`/roomDetails?id=${property.id}`);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is a customer or not logged in
    if (user && !isCustomer) {
      toast.error('Only customers can make bookings. Please switch to a customer account.'); // Use toast instead of alert
      return;
    }
    
    router.push(`/bookings?accommodationId=${property.id}`);
  };

  const isDisabled = !!(user && !isCustomer);

  return (
    <article 
      className="bg-white border rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="grid grid-cols-12 h-full">
        {/* gallery */}
        <div className="col-span-12 md:col-span-5 relative">
          <div className="relative h-full min-h-[176px]">
            <Image
              src={getFirstValidImage(property.image_urls, "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE5NSAxNDVIMjA1VjE1NUgxOTVWMTQ1WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K")}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, (min-width: 1024px) 30vw, 100vw"
              onError={(e) => {
                // Fallback to default image if the image fails to load
                const target = e.target as HTMLImageElement;
                target.src = '/images/cozy.jpg';
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-5 p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold">{property.title}</h3>
            {property.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-500 mt-3 text-sm text-wrap">
            {property.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {/* amenity chips from data */}
            {(property.amenities ?? []).map((a) => (
              <AmenityIcon key={a} name={a.toLowerCase()} />
            ))}
          </div>
        </div>

        {/* Price / Actions */}
        <div className="col-span-12 md:col-span-2 border-l p-5 flex flex-col justify-center">
          <div>
            <div className="text-2xl font-bold text-gray-800 text-center">
              <span className='text-xs text-gray-400'>Rwf</span> <br />{property.price_per_night.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 text-center uppercase mt-1">
              per night
            </div>
          </div>

          <button
            onClick={handleBookingClick}
            disabled={isDisabled}
            className={`mt-4 w-full py-2 px-3 rounded-md text-xs font-medium transition ${
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {isDisabled ? 'Customers Only' : 'Book Now'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;