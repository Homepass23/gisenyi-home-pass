import { createBooking, isAccommodationAvailable } from './supabaseHelpers'
import { Booking } from './supabaseHelpers'
import { sendBookingConfirmationEmail } from './emailHelpers'
import { getAccommodationById } from './supabaseHelpers'

/**
 * Create a new guest booking with validation
 */
export async function createGuestBooking(bookingData: Partial<Booking>) {
  try {
    // Validate required fields for guest bookings
    if (!bookingData.accommodation_id) {
      throw new Error('Accommodation ID is required')
    }
    
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      throw new Error('Check-in and check-out dates are required')
    }
    
    if (!bookingData.full_name) {
      throw new Error('Full name is required for guest bookings')
    }
    
    if (!bookingData.email) {
      throw new Error('Email is required for guest bookings')
    }
    
    if (!bookingData.phone_number) {
      throw new Error('Phone number is required for guest bookings')
    }
    
    if (!bookingData.city) {
      throw new Error('City is required for guest bookings')
    }
    
    // Validate date logic
    const checkIn = new Date(bookingData.check_in_date)
    const checkOut = new Date(bookingData.check_out_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize today to midnight for fair comparison
    
    // Normalize checkIn date to midnight for comparison
    checkIn.setHours(0, 0, 0, 0)
    
    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past')
    }
    
    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date')
    }
    
    // Check availability
    const isAvailable = await isAccommodationAvailable(
      bookingData.accommodation_id,
      bookingData.check_in_date,
      bookingData.check_out_date
    )
    
    if (!isAvailable) {
      throw new Error('Selected dates are not available')
    }
    
    // Create the booking
    const booking = await createBooking({
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    // Send confirmation email
    const accommodation = await getAccommodationById(bookingData.accommodation_id)
    if (accommodation) {
      await sendBookingConfirmationEmail(
        bookingData.email,
        bookingData.full_name,
        accommodation.title,
        bookingData.check_in_date,
        bookingData.check_out_date,
        0 // Default amount since total_amount is not in Booking interface
      )
    }
    
    return { data: booking, error: null }
  } catch (error) {
    console.error('Error in createGuestBooking:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Validate guest booking data before creation
 */
export function validateGuestBookingData(bookingData: Partial<Booking>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  if (!bookingData.accommodation_id) {
    errors.push('Accommodation is required')
  }
  
  if (!bookingData.check_in_date) {
    errors.push('Check-in date is required')
  }
  
  if (!bookingData.check_out_date) {
    errors.push('Check-out date is required')
  }
  
  if (!bookingData.num_of_guests || bookingData.num_of_guests <= 0) {
    errors.push('Number of guests is required and must be greater than 0')
  }
  
  // Validate guest info for guest bookings
  if (!bookingData.full_name) {
    errors.push('Full name is required')
  }
  
  if (!bookingData.email) {
    errors.push('Email is required')
  }
  
  if (!bookingData.phone_number) {
    errors.push('Phone number is required')
  }
  
  if (!bookingData.city) {
    errors.push('City is required')
  }
  
  // Validate dates
  if (bookingData.check_in_date && bookingData.check_out_date) {
    const checkIn = new Date(bookingData.check_in_date)
    const checkOut = new Date(bookingData.check_out_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize today to midnight for fair comparison
    
    // Normalize checkIn date to midnight for comparison
    checkIn.setHours(0, 0, 0, 0)
    
    if (checkIn < today) {
      errors.push('Check-in date cannot be in the past')
    }
    
    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}