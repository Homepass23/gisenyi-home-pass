'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createNewBooking } from '../../lib/bookingHelpers'
import { createGuestBooking, validateGuestBookingData } from '../../lib/guestBookingHelpers'
import { isAccommodationAvailable, isRoomAvailable } from '../../lib/supabaseHelpers'
import BookingStepper from '../components/features/BookingStepper'
import { fetchAccommodationById, fetchAccommodationRoomById, QueryAccommodation } from '../../lib/queryHelpers'
import { getFirstValidImage } from '../../lib/imageHelpers'
import Image from 'next/image'

function BookingPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const accommodationId = searchParams.get('accommodationId')
  const roomId = searchParams.get('roomId')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState(checkIn || '')
  const [checkOutDate, setCheckOutDate] = useState(checkOut || '')
  const [numOfGuests, setNumOfGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dateError, setDateError] = useState('') // New state for date availability errors
  
  // Accommodation and room state
  const [accommodation, setAccommodation] = useState<QueryAccommodation | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [room, setRoom] = useState<any | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  
  // Guest booking form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  
  const [showGuestForm, setShowGuestForm] = useState(!user)

  // Fetch accommodation and room details
  useEffect(() => {
    const fetchData = async () => {
      if (!accommodationId) {
        setDataLoading(false)
        return
      }
      
      try {
        // Fetch accommodation details
        const accommodationData = await fetchAccommodationById(accommodationId)
        setAccommodation(accommodationData)
        
        // If roomId is provided, fetch room details
        if (roomId) {
          const roomData = await fetchAccommodationRoomById(roomId)
          setRoom(roomData)
          // Set number of guests from room data
          setNumOfGuests(roomData.num_of_guests)
        } else {
          // Set number of guests from accommodation data
          setNumOfGuests(accommodationData.max_guests || 1)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load accommodation details')
        toast.error('Failed to load accommodation details. Please try again.')
      } finally {
        setDataLoading(false)
      }
    }
    
    fetchData()
  }, [accommodationId, roomId])

  // Check date availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkInDate || !checkOutDate || !accommodationId) {
        setDateError('')
        return
      }
      
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        setDateError('Check-out date must be after check-in date')
        return
      }
      
      try {
        // Check if accommodation/room is available for the selected dates
        let isAvailable = true;
        
        if (roomId) {
          // Check room availability
          isAvailable = await isRoomAvailable(roomId, checkInDate, checkOutDate);
        } else if (accommodationId) {
          // Check accommodation availability
          isAvailable = await isAccommodationAvailable(accommodationId, checkInDate, checkOutDate);
        }
        
        if (!isAvailable) {
          setDateError('Selected dates are not available. Please choose different dates.');
        } else {
          setDateError('');
        }
      } catch (err) {
        console.error('Error checking availability:', err)
        setDateError('Error checking date availability. Please try again.')
      }
    }
    
    checkAvailability()
  }, [checkInDate, checkOutDate, accommodationId, roomId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accommodationId) {
      setError('Missing accommodation information')
      return
    }
    
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates')
      return
    }
    
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Check-out date must be after check-in date')
      return
    }
    
    // Check if there's a date availability error
    if (dateError) {
      setError('Selected dates are not available. Please choose different dates.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      if (user) {
        // Authenticated user booking
        const result = await createNewBooking({
          accommodation_id: accommodationId,
          room_id: roomId || undefined,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          num_of_guests: numOfGuests,
          customer_id: user.id
        })
        
        if (result.error) {
          setError((result.error as Error).message || 'Failed to create booking')
          toast.error('Failed to create booking. Please try again.')
        } else {
          setSuccess(true)
          toast.success('Booking created successfully! Redirecting to your dashboard...')
          // Redirect to customer dashboard after 2 seconds
          setTimeout(() => {
            router.push('/customer')
          }, 2000)
        }
      } else {
        // Guest booking
        const guestBookingData = {
          accommodation_id: accommodationId,
          room_id: roomId || undefined,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          num_of_guests: numOfGuests,
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          street_address: streetAddress,
          city: city
        }
        
        // Validate guest booking data
        const validation = validateGuestBookingData(guestBookingData)
        if (!validation.isValid) {
          setError(validation.errors.join(', '))
          toast.error('Please fix the errors in the form: ' + validation.errors.join(', '))
          setLoading(false)
          return
        }
        
        const result = await createGuestBooking(guestBookingData)
        
        if (result.error) {
          setError((result.error as Error).message || 'Failed to create booking')
          toast.error('Failed to create booking. Please try again.')
        } else {
          setSuccess(true)
          toast.success('Booking created successfully! Redirecting to home page...')
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Booking error:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  // Use room price if booking a specific room, otherwise use accommodation price
  const pricePerNight = room ? room.price_per_night : (accommodation ? accommodation.price_per_night : 0)
  const totalPrice = nights * pricePerNight

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white mt-22 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accommodation details...</p>
        </div>
      </div>
    )
  }

  // Determine what we're booking: room or entire accommodation
  const isRoomBooking = !!roomId && !!room
  const bookingTitle = isRoomBooking ? room?.room_name : accommodation?.title
  const bookingImages = isRoomBooking ? room?.image_urls : accommodation?.image_urls
  const bookingLocation = accommodation?.location
  const bookingRating = accommodation?.rating

  return (
    <div className="min-h-screen bg-white mt-21 pb-12">
        <BookingStepper currentStep={3} />
      <div className="max-w-6xl mx-auto">
        
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-sky-600 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Complete Your Booking</h1>
            <p className="text-sky-100 mt-2">Review your stay details and provide guest information</p>
          </div>
          
          <div className="p-6 md:p-8">
            {accommodation && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={getFirstValidImage(bookingImages || [], 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE5NSAxNDVIMjA1VjE1NUgxOTVWMTQ1WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K')}
                        alt={bookingTitle || 'Accommodation'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold text-gray-800">{bookingTitle}</h2>
                    {isRoomBooking && (
                      <p className="text-gray-600 mt-1">Room in {accommodation.title}</p>
                    )}
                    <p className="text-gray-600 mt-1">{bookingLocation}</p>
                    
                    {bookingRating && (
                      <div className="flex items-center mt-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-5 h-5 ${i < Math.floor(bookingRating) ? 'fill-current' : 'text-gray-300'}`} 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600">{bookingRating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span>{numOfGuests} guest{numOfGuests !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span>
                          {isRoomBooking 
                            ? 'Private room' 
                            : (accommodation.type === 'entire' ? 'Entire place' : 'Private room')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Flexible</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rwf{pricePerNight.toLocaleString()} x {nights} night{nights !== 1 ? 's' : ''}</span>
                        <span className="font-medium">Rwf{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg text-sky-600">Rwf{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!user && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-semibold text-blue-800 mb-1">Booking Options</h2>
                    <p className="text-blue-700">
                      Choose how you&#39;d like to proceed with your booking
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setShowGuestForm(true)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                        showGuestForm 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      Book as Guest
                    </button>
                    <button
                      onClick={() => router.push('/login?action=register')}
                      className="px-5 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-all shadow-md"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-green-700 mb-4">
                  {user 
                    ? 'Your booking request has been submitted successfully. You will be redirected to your dashboard shortly.' 
                    : 'Your booking request has been submitted successfully. A confirmation email has been sent. You will be redirected to the home page shortly.'}
                </p>
                <div className="animate-pulse w-12 h-1 bg-green-200 rounded-full mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Stay Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            min={checkInDate || new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        {/* Display date availability error */}
                        {dateError && (
                          <p className="mt-2 text-sm text-red-600">{dateError}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests
                        </label>
                        {/* Display as read-only text instead of dropdown */}
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                          {numOfGuests} {numOfGuests === 1 ? 'Guest' : 'Guests'}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          This is determined by the accommodation and cannot be changed.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!user && showGuestForm && (
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="+1234567890"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="123 Main Street"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="City"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 mb-4 sm:mb-0 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    ← Back
                  </button>
                  
                  <div className="flex space-x-3">
                    {!user && (
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="px-6 py-3 text-sky-700 font-medium rounded-lg border border-sky-300 hover:bg-sky-50 transition-all"
                      >
                        Sign In
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading || !!dateError} // Disable if there's a date error
                      className={`px-8 py-3 bg-gradient-to-r from-sky-600 to-blue-700 text-white font-medium rounded-lg hover:from-sky-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl ${
                        dateError ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        <span>{user ? 'Confirm Booking' : 'Submit Guest Booking'}</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Need help? Contact our support team at support@gisenyahomepass.com</p>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white mt-22 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  )
}