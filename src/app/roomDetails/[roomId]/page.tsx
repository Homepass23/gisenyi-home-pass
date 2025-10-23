'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAccommodationRoomById, fetchAccommodationById, fetchRoomBookings } from '../../../lib/queryHelpers';
import { getFirstValidImage } from '../../../lib/imageHelpers';
import { isRoomAvailable } from '../../../lib/supabaseHelpers';
import { hasUserBookedAccommodation } from '../../../lib/bookingHelpers';
import Breadcrumb from '../../components/ui/Breadcrumb';
import BookingStepper from '../../components/features/BookingStepper';
import ReviewForm from '../../components/features/ReviewForm';
import { useAuth } from '../../../context/AuthContext';

// Define type for calendar day
interface CalendarDay {
  day: number;
  isAvailable: boolean;
  date: Date;
}

// Define type for review
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
  };
}

const RoomDetailsComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isCustomer } = useAuth();
  const roomId = searchParams.get('roomId');
  const accommodationId = searchParams.get('accommodationId');

  // Fetch room data
  const { data: room, isLoading: isRoomLoading, error: roomError } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchAccommodationRoomById(roomId as string),
    enabled: !!roomId,
  });

  // Fetch parent accommodation data
  const { data: accommodation, isLoading: isAccommodationLoading, error: accommodationError } = useQuery({
    queryKey: ['accommodation', accommodationId],
    queryFn: () => fetchAccommodationById(accommodationId as string),
    enabled: !!accommodationId,
  });

  // Fetch room bookings for availability calendar
  const { data: bookings = [] } = useQuery({
    queryKey: ['room-bookings', roomId],
    queryFn: () => fetchRoomBookings(roomId as string),
    enabled: !!roomId,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // State for review functionality
  const [hasBooked, setHasBooked] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

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

  const nextImage = () => {
    if (room?.image_urls) {
      setCurrentImageIndex((prev) => (prev + 1) % room.image_urls.length);
    }
  };

  const prevImage = () => {
    if (room?.image_urls) {
      setCurrentImageIndex((prev) => (prev - 1 + room.image_urls.length) % room.image_urls.length);
    }
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
    
    if (!roomId) {
      toast.error('Room information is missing');
      return;
    }
    
    // Check if user is a customer or not logged in
    if (user && !isCustomer) {
      toast.error('Only customers can make bookings. Please switch to a customer account.');
      return;
    }
    
    try {
      // Check if room is available for the selected dates
      const isAvailable = await isRoomAvailable(roomId, checkInDate, checkOutDate);
      
      if (!isAvailable) {
        toast.error('Selected dates are not available. Please choose different dates.');
        return;
      }
      
      // Pass both accommodationId and roomId to the booking page
      router.push(`/bookings?accommodationId=${accommodationId}&roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
      toast.success('Redirecting to booking page...');
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error checking date availability. Please try again.');
    }
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Default images if room data is not available
  const defaultImages = [
    '/images/cozy.jpg',
    '/images/bedroom.jpg',
    '/images/Room1.jpg'
  ];

  const currentImages = room?.image_urls && room.image_urls.length > 0 
    ? room.image_urls
    : defaultImages;

  if (isRoomLoading || isAccommodationLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-20">Loading room details...</div>
      </div>
    );
  }

  if (roomError || accommodationError || !room || !accommodation) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-20 text-red-500">
          {roomError || accommodationError ? 'Error loading room details.' : 'Room not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 pb-16 w-full max-w-7xl mx-auto bg-white">
      <BookingStepper currentStep={2} />
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Breadcrumb 
          items={[
            { name: 'Home', href: '/' }, 
            { name: 'Accommodations', href: '/accommodations' }, 
            { name: accommodation.title, href: `/roomDetails?id=${accommodationId}` },
            { name: room.room_name }
          ]}
        />
      </div>
      <section className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{room.room_name}</h1>
              <p className="text-gray-600 mb-2">
                Room in <a 
                  href={`/roomDetails?id=${accommodationId}`} 
                  className="text-sky-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/roomDetails?id=${accommodationId}`);
                  }}
                >
                  {accommodation.title}
                </a>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  {accommodation.rating ? renderStars(accommodation.rating) : renderStars(0)}
                  <span className="ml-1">{accommodation.rating || 'No rating'}</span>
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
                  Rwf{room.price_per_night.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative mb-8 h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={getFirstValidImage([currentImages[currentImageIndex]])}
            alt={room.room_name}
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
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-gray-600">
                  <span className="text-lg">👥</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{room.num_of_guests} Guests</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-gray-600">
                  <span className="text-lg">🛏️</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{room.num_of_beds} Beds</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-gray-600">
                  <span className="text-lg">🚿</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {room.private_bathroom ? 'Private' : 'Shared'} Bath
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-bold mb-4">About this room</h2>
              <p className="text-gray-700 leading-relaxed">
                {room.description || accommodation.description || `Enjoy your stay in this comfortable ${room.room_name} located within ${accommodation.title}.`}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Reviews</h2>
                <a 
                  href={`/roomDetails?id=${accommodationId}`} 
                  className="text-sky-600 hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/roomDetails?id=${accommodationId}`);
                  }}
                >
                  See all accommodation reviews
                </a>
              </div>
              
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
                        {review.user?.name ? review.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
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
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="text-2xl font-bold text-gray-800">
                    Rwf{room.price_per_night.toLocaleString()}
                  </div>
                  <div className="text-gray-500">per night</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {accommodation.rating ? renderStars(accommodation.rating) : renderStars(0)}
                  <span className="ml-1">{accommodation.rating || 'No rating'}</span>
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
                  disabled={!!(user && !isCustomer)}
                  className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-medium transition ${
                    user && !isCustomer 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  {user && !isCustomer ? 'Customers Only' : 'Request Booking'}
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                You won&apos;t be charged yet
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Booking this room will reserve just the {room.room_name} within {accommodation.title}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetailsComponent;