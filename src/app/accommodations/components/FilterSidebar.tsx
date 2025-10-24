'use client';

import React from 'react';
import PriceFilter from './PriceFilter';
import AmenitiesFilter from './AmenitiesFilter';
import RoomTypeFilter from './RoomTypeFilter';
import RatingFilter from './RatingFilter';
import OptionsFilter from './OptionsFilter';
import GuestFilter from './GuestFilter';
import DateFilter from './DateFilter';

interface FilterSidebarProps {
  minPrice: string;
  maxPrice: string;
  amenities: Record<string, boolean>;
  roomType: 'house' | 'room' | null;
  rating: number | null;
  freeCancel: boolean;
  maxGuests: number | null;
  checkInDate: string;
  checkOutDate: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onAmenitiesChange: (value: Record<string, boolean>) => void;
  onRoomTypeChange: (value: 'house' | 'room' | null) => void;
  onRatingChange: (value: number | null) => void;
  onFreeCancelChange: (value: boolean) => void;
  onMaxGuestsChange: (value: number | null) => void;
  onCheckInDateChange: (value: string) => void;
  onCheckOutDateChange: (value: string) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({
  minPrice,
  maxPrice,
  amenities,
  roomType,
  rating,
  freeCancel,
  maxGuests,
  checkInDate,
  checkOutDate,
  onMinPriceChange,
  onMaxPriceChange,
  onAmenitiesChange,
  onRoomTypeChange,
  onRatingChange,
  onFreeCancelChange,
  onMaxGuestsChange,
  onCheckInDateChange,
  onCheckOutDateChange,
  onClearFilters
}: FilterSidebarProps) => {
  return (
    <aside className="col-span-12 lg:col-span-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Booking Details</div>
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:underline"
          >
            Clear all
          </button>
        </div>

        <DateFilter 
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onCheckInDateChange={onCheckInDateChange}
          onCheckOutDateChange={onCheckOutDateChange}
        />

        <GuestFilter 
          maxGuests={maxGuests}
          onMaxGuestsChange={onMaxGuestsChange}
        />
        
        <PriceFilter 
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
        />
        
        <AmenitiesFilter 
          amenities={amenities}
          onAmenitiesChange={onAmenitiesChange}
        />
        
        <RoomTypeFilter 
          roomType={roomType}
          onRoomTypeChange={onRoomTypeChange}
        />
        
        <RatingFilter 
          rating={rating}
          onRatingChange={onRatingChange}
        />
        
        <OptionsFilter 
          freeCancel={freeCancel}
          onFreeCancelChange={onFreeCancelChange}
        />

        <div className="text-sm text-gray-400">
          Filter and refine your search to find the best match.
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;