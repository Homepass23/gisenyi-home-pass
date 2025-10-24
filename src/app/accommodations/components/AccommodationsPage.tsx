"use client";

import React from "react";
import { useAccommodations, useTotalAccommodationsCount } from "../../../hooks/useAccommodations";
import { useInView } from "react-intersection-observer";
import FilterSidebar from "./FilterSidebar";
import PropertyList from "./PropertyList";
import SortControl from "./SortControl";
import BookingStepper from "../../components/features/BookingStepper";
import { useAccommodationsFilters } from "../hooks/useAccommodationsFilters";
import { QueryAccommodation } from "../../../lib/queryHelpers";
import Breadcrumb from "../../components/ui/Breadcrumb";

// Extended type to include pagination info
interface PaginatedAccommodations extends Array<QueryAccommodation> {
  _totalCount?: number;
}

export default function AccommodationsPage() {
  const {
    minPrice,
    maxPrice,
    amenities,
    roomType,
    rating,
    freeCancel,
    sortBy,
    maxGuests,
    checkInDate,
    checkOutDate,
    setMinPrice,
    setMaxPrice,
    setAmenities,
    setRoomType,
    setRating,
    setFreeCancel,
    setSortBy,
    setMaxGuests,
    setCheckInDate,
    setCheckOutDate,
    clearFilters
  } = useAccommodationsFilters();

  // Convert UI state to filter parameters
  const selectedAmenities = Object.entries(amenities)
    .filter((entry) => entry[1]) // entry[1] is the isSelected value
    .map((entry) => entry[0]); // entry[0] is the amenity name

  // Fetch accommodations from Supabase with React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useAccommodations({
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    amenities: selectedAmenities,
    roomType: roomType || undefined,
    minRating: rating || undefined,
    freeCancel: freeCancel || undefined,
    sortBy: sortBy !== "default" ? sortBy : undefined,
    maxGuests: maxGuests || undefined,
    checkInDate: checkInDate || undefined,
    checkOutDate: checkOutDate || undefined,
  });

  // Fetch total accommodations count before filtering
  const { data: totalAccommodationsCount } = useTotalAccommodationsCount();

  // Flatten the pages into a single array
  const allRooms = data?.pages.flat() || [];
  
  // Calculate total count from all pages
  const totalCount = data?.pages.reduce((total, page) => {
    // Get the total count from the first page if available
    const pageWithCount = page as PaginatedAccommodations;
    if (pageWithCount._totalCount !== undefined) {
      return pageWithCount._totalCount;
    }
    return total + page.length;
  }, 0) || 0;

  // Infinite scroll setup
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView();
  
  // Connect the refs
  React.useEffect(() => {
    if (scrollRef.current) {
      inViewRef(scrollRef.current);
    }
  }, [inViewRef]);
  
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return <div className="w-full mt-21 py-20 text-center">Loading accommodations...</div>;
  }

  if (status === 'error') {
    return <div className="w-full mt-21 py-20 text-center">Error loading accommodations.</div>;
  }

  return (
    <div className="w-full mt-16 sm:mt-20">
      <BookingStepper currentStep={1} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <Breadcrumb 
          items={[{ name: 'Home', href: '/' }, { name: 'Accommodations' }]}
        />
      </div>
      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 pt-4 sm:pt-6 grid grid-cols-12 gap-4 sm:gap-6">
        <FilterSidebar 
          minPrice={minPrice}
          maxPrice={maxPrice}
          amenities={amenities}
          roomType={roomType}
          rating={rating}
          freeCancel={freeCancel}
          maxGuests={maxGuests}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onAmenitiesChange={setAmenities}
          onRoomTypeChange={setRoomType}
          onRatingChange={setRating}
          onFreeCancelChange={setFreeCancel}
          onMaxGuestsChange={setMaxGuests}
          onCheckInDateChange={setCheckInDate}
          onCheckOutDateChange={setCheckOutDate}
          onClearFilters={clearFilters}
        />
        
        <div className="col-span-12 lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600">
              You found {totalCount} accommodations
              {maxGuests && ` for ${maxGuests} guest${maxGuests > 1 ? 's' : ''}`}
              {checkInDate && checkOutDate && ` from ${checkInDate} to ${checkOutDate}`}
              {minPrice && ` from Rwf${minPrice}`}
              {maxPrice && ` to Rwf${maxPrice}`}
              {roomType && ` (${roomType})`}
              {rating && ` rated ${rating}+ stars`}
              {freeCancel && ' with free cancellation'}
              {` from ${totalAccommodationsCount || 0} total accommodations`}
            </div>
            <SortControl 
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
          <PropertyList 
            properties={allRooms}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            scrollRef={scrollRef}
          />
        </div>
      </section>
    </div>
  );
}