'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Bed } from 'lucide-react';
import { FaBath, FaBed } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAccommodationById, fetchSimilarAccommodationsByPriceAndType, fetchAccommodationBookings, fetchAccommodationRooms } from '../../lib/queryHelpers';
import { getFirstValidImage } from '../../lib/imageHelpers';
import { isAccommodationAvailable } from '../../lib/supabaseHelpers';
import { hasUserBookedAccommodation } from '../../lib/bookingHelpers';
import Breadcrumb from '../components/ui/Breadcrumb';
import AmenityIcon from '../components/shared/AmenityIcon';
import PropertyCardItem from '../components/features/PropertyCardItem';
import BookingStepper from '../components/features/BookingStepper';
import ReviewForm from '../components/features/ReviewForm';
import { useAuth } from '../../context/AuthContext';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
  };
}

// Define type for calendar day
interface CalendarDay {
  day: number;
  isAvailable: boolean;
  date: Date;
}

const RoomDetailsComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isCustomer } = useAuth();
  const accommodationId = searchParams.get('id');

  // State for review functionality
  const [hasBooked, setHasBooked] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  // Fetch accommodation data
  const { data: accommodation, isLoading, error } = useQuery({
    queryKey: ['accommodation', accommodationId],
    queryFn: () => fetchAccommodationById(accommodationId as string),
    enabled: !!accommodationId,
  });

  // Fetch accommodation bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['accommodation-bookings', accommodationId],
    queryFn: () => fetchAccommodationBookings(accommodationId as string),
    enabled: !!accommodationId,
  });

  // Fetch similar accommodations based on price range and type (without location constraint)
  const { data: similarAccommodations } = useQuery({
    queryKey: ['similar-accommodations-price-type', accommodation?.id],
    queryFn: () => fetchSimilarAccommodationsByPriceAndType(
      accommodation?.location || '', 
      accommodation?.id || '', 
      accommodation?.price_per_night || 0, 
      accommodation?.type || 'room', 
      3
    ),
    enabled: !!accommodation?.id && accommodation?.price_per_night !== undefined && accommodation?.type !== undefined,
  });

  // Fetch accommodation rooms for houses that allow independent room booking
  const { data: accommodationRooms = [] } = useQuery({
    queryKey: ['accommodation-rooms', accommodationId],
    queryFn: () => fetchAccommodationRooms(accommodationId as string),
    enabled: !!accommodationId && accommodation?.allow_independent_room_booking,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Check if user has booked this accommodation
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (user && isCustomer && accommodationId) {
        const booked = await hasUserBookedAccommodation(user.id, accommodationId);
        setHasBooked(booked);
      }
    };

    checkBookingStatus();
  }, [user, isCustomer, accommodationId, reviewsRefreshKey]);

  // Update calendar when current date changes
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // If selected date is in the past, reset to current month
    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
    }
  }, [selectedMonth, selectedYear]);

  // Generate avatar initials from user name
  const getAvatarInitials = (name: string | undefined) => {
    if (!name) return 'U'; // Unknown user
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calendar logic
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      // Normalize dates to remove time component for comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const generateCalendar = (): (CalendarDay | null)[] => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days: (CalendarDay | null)[] = [];

    // Empty cells for days before the first day of the month
    // Adjust for Sunday as first day (0) -> shift to end
    const emptyCells = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < emptyCells; i++) {
      days.push(null);
    }

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      // Skip past dates completely
      if (date < today) {
        // Add a null entry to maintain grid structure for past dates
        days.push(null);
        continue;
      }
      
      // Check if date is booked
      const isBooked = isDateBooked(date);
      
      // Date is available if it's not booked
      const isAvailable = !isBooked;
      
      days.push({ day, isAvailable, date });
    }

    return days;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (accommodation?.image_urls?.length || images.length));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (accommodation?.image_urls?.length || images.length)) % (accommodation?.image_urls?.length || images.length));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    
    if (!accommodationId) {
      toast.error('Accommodation information is missing');
      return;
    }
    
    // Check if user is a customer or not logged in
    if (user && !isCustomer) {
      toast.error('Only customers can make bookings. Please switch to a customer account.');
      return;
    }
    
    try {
      // Check if accommodation is available for the selected dates
      const isAvailable = await isAccommodationAvailable(accommodationId, checkInDate, checkOutDate);
      
      if (!isAvailable) {
        toast.error('Selected dates are not available. Please choose different dates.');
        return;
      }
      
      router.push(`/bookings?accommodationId=${accommodationId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
      toast.success('Redirecting to booking page...');
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error checking date availability. Please try again.');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Default images if accommodation data is not available
  const images = [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop'
  ];

  const currentImages = accommodation?.image_urls && accommodation.image_urls.length > 0 
    ? accommodation.image_urls.map(url => getFirstValidImage([url]))
    : images;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-20">Loading room details...</div>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-20 text-red-500">
          {error ? 'Error loading room details.' : 'Room not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 pb-16 w-full max-w-7xl mx-auto bg-white">
      <BookingStepper currentStep={2} />
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Breadcrumb 
          items={[{ name: 'Home', href: '/' }, { name: 'Accommodations', href: '/accommodations' }, { name: accommodation.title }]}
        />
      </div>
      <section className="max-w-6xl mx-auto px-6">
      {/* Header Section */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{accommodation.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                {renderStars(accommodation.rating)}
                <span className="ml-1">{accommodation.rating}</span>
              </span>
              <span>•</span>
              <span>{accommodation.location}</span>
              <span>•</span>
              <span className="text-sky-600 font-medium">View on map</span>
            </div>
          </div>
          <div className="bg-sky-50 p-4 rounded-lg">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                Rwf{accommodation.price_per_night.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">per night</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative mb-8 h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={currentImages[currentImageIndex]}
          alt="Room view"
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to default image if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/images/cozy.jpg';
          }}
        />
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {currentImages.map((_: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Room Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <Bed className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500 font-medium">{accommodation.max_guests} Guests</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <FaBath className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500 font-medium">{accommodation.bathroom_count || 0} Bathrooms</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <FaBed className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500 font-medium">{accommodation.room_count || 0} Bedrooms</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4">About this accommodation</h2>
            <p className="text-gray-700 leading-relaxed">
              {accommodation.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {accommodation.amenities && accommodation.amenities.length > 0 ? (
                accommodation.amenities.map((amenity, idx) => (
                  <AmenityIcon key={idx} name={amenity.toLowerCase()} />
                ))
              ) : (
                <p className="text-gray-500">No amenities available for this accommodation.</p>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Reviews</h2>
            
            {/* Review Form - Only show if user is a customer and has booked this accommodation */}
            {user && isCustomer && hasBooked && (
              <div className="mb-8">
                <ReviewForm 
                  accommodationId={accommodationId as string} 
                  onReviewSubmitted={() => setReviewsRefreshKey(prev => prev + 1)} 
                />
              </div>
            )}
            
            {user && isCustomer && !hasBooked && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  You can only review accommodations you have stayed at. Book this accommodation to leave a review after your stay.
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              {accommodation.reviews && accommodation.reviews.length > 0 ? (
                accommodation.reviews.map((review: Review) => (
                  <div key={review.id} className="flex gap-4 border-b border-gray-200 pb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                      {getAvatarInitials(review.user?.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-2">{renderStars(review.rating)}</div>
                      <p className="text-sm text-gray-500 italic mb-2">
                        {review.user?.name || 'Anonymous User'}
                      </p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet for this accommodation.</p>
              )}
            </div>
          </div>

          {/* Available Rooms for houses that allow independent room booking */}
          {accommodation.allow_independent_room_booking && accommodationRooms && accommodationRooms.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-bold mb-6">Available Rooms</h2>
              <p className="text-gray-600 mb-4">This accommodation offers individual rooms that can be booked separately.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accommodationRooms.map((room) => {
                  // Transform room data to Property type for PropertyCardItem
                  const property = {
                    id: room.id,
                    title: room.room_name,
                    image: getFirstValidImage(room.image_urls),
                    location: accommodation.location,
                    price: `Rwf${room.price_per_night.toLocaleString()}`,
                    bedrooms: room.num_of_beds || 1,
                    bathrooms: room.private_bathroom ? 1 : 0,
                    rating: accommodation.rating
                  };
                  
                  return (
                    <div key={room.id} className="relative">
                      <PropertyCardItem 
                        property={property} 
                        onClick={() => router.push(`/roomDetails/${room.id}?roomId=${room.id}&accommodationId=${accommodationId}`)}
                      />
                      <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                        Room
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <div className="text-2xl font-bold text-gray-800">
                  Rwf{accommodation.price_per_night.toLocaleString()}
                </div>
                <div className="text-gray-500">per night</div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {renderStars(accommodation.rating)}
                <span className="ml-1">{accommodation.rating}</span>
                <span>•</span>
                <span className="text-sky-600 underline">
                  {accommodation.reviews && accommodation.reviews.length > 0 
                    ? `${accommodation.reviews.length} reviews` 
                    : 'No reviews yet'}
                </span>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select dates</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => {
                      // Prevent navigating to past months
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const currentMonth = currentDate.getMonth();
                      
                      // If we're at the current month/year, don't go back further
                      if (selectedYear <= currentYear && selectedMonth <= currentMonth) {
                        return;
                      }
                      
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(selectedMonth - 1);
                      }
                    }}
                    className={`p-1 hover:bg-gray-100 rounded ${(() => {
                      // Disable button if we're at or before the current month
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const currentMonth = currentDate.getMonth();
                      const isDisabled = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth <= currentMonth);
                      return isDisabled ? 'opacity-50 cursor-not-allowed' : '';
                    })()}`}
                    disabled={(() => {
                      // Disable button if we're at or before the current month
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const currentMonth = currentDate.getMonth();
                      return selectedYear < currentYear || (selectedYear === currentYear && selectedMonth <= currentMonth);
                    })()}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h4 className="text-md font-medium text-gray-700">
                    {monthNames[selectedMonth]} {selectedYear}
                  </h4>
                  <button
                    onClick={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(selectedYear + 1);
                      } else {
                        setSelectedMonth(selectedMonth + 1);
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                  {generateCalendar().map((dayObj, idx) => (
                    dayObj ? (
                      <div
                        key={idx}
                        className={`text-center py-2 text-sm rounded-full ${
                          dayObj.isAvailable
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'
                            : 'bg-red-50 text-red-400 line-through'
                        }`}
                      >
                        {dayObj.day}
                      </div>
                    ) : (
                      <div key={idx} className="text-center py-2 text-sm"></div>
                    )
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-50 rounded-full border border-blue-200"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-50 rounded-full border border-red-200"></div>
                    <span className="text-gray-600">Booked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button 
                onClick={handleBooking}
                disabled={!!user && !isCustomer}
                className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-medium transition ${
                  user && !isCustomer 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                {user && !isCustomer ? 'Customers Only' : 'Request Booking'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              You won&apos;t be charged yet
            </div>
          </div>
        </div>
      </div>

      {/* Similar Rooms */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif font-bold mb-6">Similar accommodations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarAccommodations && similarAccommodations.length > 0 ? (
            similarAccommodations.map((accommodation) => {
              // Transform QueryAccommodation to Property type for display
              const property = {
                id: accommodation.id,
                title: accommodation.title,
                image: getFirstValidImage(accommodation.image_urls),
                location: accommodation.location,
                price: `Rwf${accommodation.price_per_night.toLocaleString()}`,
                bedrooms: accommodation.room_count || 0,
                bathrooms: accommodation.bathroom_count || 0,
                rating: accommodation.rating
              };
              
              return (
                <PropertyCardItem 
                  key={accommodation.id} 
                  property={property} 
                  onClick={() => router.push(`/roomDetails?id=${accommodation.id}`)}
                />
              );
            })
          ) : (
            <p className="text-gray-500 col-span-3">
              No similar accommodations found.
            </p>
          )}
        </div>
      </div>
      </section>
    </div>
  );
};

export default function RoomDetailsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    }>
      <RoomDetailsComponent />
    </Suspense>
  );
}