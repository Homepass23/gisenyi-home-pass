import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const useAccommodationsFilters = () => {
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: false,
    coffee: false,
    tv: false,
    cutlery: false,
    breakfast: false,
    ac: false,
    parking: false,
  });
  const [roomType, setRoomType] = useState<'house' | 'room' | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [freeCancel, setFreeCancel] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [maxGuests, setMaxGuests] = useState<number | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");

  // Initialize filters from URL parameters
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const typeParam = searchParams.get('type');
    
    if (checkInParam) setCheckInDate(checkInParam);
    if (checkOutParam) setCheckOutDate(checkOutParam);
    if (guestsParam) setMaxGuests(parseInt(guestsParam) || null);
    if (typeParam && (typeParam === 'house' || typeParam === 'room')) {
      setRoomType(typeParam);
    }
  }, [searchParams]);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setAmenities({
      wifi: false,
      coffee: false,
      tv: false,
      cutlery: false,
      breakfast: false,
      ac: false,
      parking: false,
    });
    setRoomType(null);
    setRating(null);
    setFreeCancel(false);
    setSortBy("default");
    setMaxGuests(null);
    setCheckInDate("");
    setCheckOutDate("");
  };

  return {
    // State values
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
    
    // Setter functions
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
    
    // Helper functions
    clearFilters
  };
};