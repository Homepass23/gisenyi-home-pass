import { 
  createBooking,
  getBookingsByUserId,
  getBookingsByAccommodationId,
  updateBookingStatus
} from './supabaseHelpers'
import { Booking } from './supabaseHelpers'
import { supabase } from './supabaseClient'

/**
 * Create a new booking with validation and authentication
 */
export async function createNewBooking(bookingData: Partial<Booking>, userId: string) {
  try {
    // Validate required fields
    if (!bookingData.accommodation_id) {
      throw new Error('Accommodation ID is required')
    }
    
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      throw new Error('Check-in and check-out dates are required')
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
    
    // Add user ID to booking data
    const fullBookingData = {
      ...bookingData,
      customer_id: userId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Partial<Booking>
    
    // Create the booking
    const booking = await createBooking(fullBookingData)
    
    return { data: booking, error: null }
  } catch (error) {
    console.error('Error in createNewBooking:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get booking history for a user
 */
export async function getUserBookingHistory(userId: string) {
  try {
    const bookings = await getBookingsByUserId(userId)
    return { data: bookings, error: null }
  } catch (error) {
    console.error('Error fetching user booking history:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get bookings for an accommodation (for hosts/admins)
 */
export async function getAccommodationBookings(accommodationId: string) {
  try {
    const bookings = await getBookingsByAccommodationId(accommodationId)
    return { data: bookings, error: null }
  } catch (error) {
    console.error('Error fetching accommodation bookings:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Cancel a booking (customer initiated)
 */
export async function cancelBooking(bookingId: string, userId: string) {
  try {
    // First, verify that the user owns this booking
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
    
    if (fetchError) {
      throw new Error('Booking not found')
    }
    
    // Check if booking exists
    if (!bookings || bookings.length === 0) {
      throw new Error('Booking not found')
    }
    
    const booking = bookings[0];
    
    if (booking.customer_id !== userId) {
      throw new Error('Unauthorized: You can only cancel your own bookings')
    }
    
    // Update the booking status
    const data = await updateBookingStatus(bookingId, 'cancelled')
    
    return { data, error: null }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Approve or reject a booking (admin action)
 */
export async function processBooking(bookingId: string, status: 'confirmed' | 'rejected') {
  try {
    // In a real implementation, you would verify that the user is an admin
    // For now, we'll just update the status
    
    const data = await updateBookingStatus(bookingId, status)
    
    return { data, error: null }
  } catch (error) {
    console.error(`Error ${status}ing booking:`, error)
    return { data: null, error: error as Error }
  }
}