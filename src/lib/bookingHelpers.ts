import { 
  createBooking,
  isAccommodationAvailable,
  isRoomAvailable,
  Booking
} from './supabaseHelpers'
import { supabase } from './supabaseClient'

/**
 * Create a new booking with validation
 */
export async function createNewBooking(bookingData: Partial<Booking>): Promise<{ data: Booking[] | null; error: Error | null }> {
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
    
    // Check availability
    let isAvailable = true;
    if (bookingData.room_id) {
      // Check room availability
      isAvailable = await isRoomAvailable(bookingData.room_id, bookingData.check_in_date, bookingData.check_out_date);
    } else {
      // Check accommodation availability
      isAvailable = await isAccommodationAvailable(bookingData.accommodation_id, bookingData.check_in_date, bookingData.check_out_date);
    }
    
    if (!isAvailable) {
      throw new Error('Selected dates are not available. Please choose different dates.')
    }
    
    // Create the booking
    console.log('Creating booking with data:', {
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    const booking = await createBooking({
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    return { data: booking, error: null }
  } catch (error) {
    console.error('Error in createNewBooking:', error);
    return { data: null, error: error as Error }
  }
}

/**
 * Check if a date range overlaps with existing bookings
 */
export async function checkDateOverlap(): Promise<boolean> {
  // Skip this for now
  return true;
}

/**
 * Get booking history for a user
 */
export async function getUserBookingHistory() {
  // Skip this for now
  return [];
}

/**
 * Cancel a booking (customer initiated)
 */
export async function cancelBooking() {
  // In a real implementation, you would verify that the user owns this booking
  // For now, we'll just update the status
  // TODO: Add proper authorization check
  console.log(`User is attempting to cancel booking`)
  // Skip this for now
  return null;
}

/**
 * Approve or reject a booking (admin/host action)
 */
export async function processBooking() {
  // Skip this for now
  return null;
}

interface SimpleBooking {
  id: string;
  status: string;
  check_out_date: string;
}

/**
 * Check if a user has booked a specific accommodation
 */
/**
 * Check if a user has booked a specific accommodation
 * A user has booked if they have a confirmed booking for that accommodation
 * and the stay has already completed (check_out_date in the past)
 */
export async function hasUserBookedAccommodation(userId: string, accommodationId: string): Promise<boolean> {
  try {
    // Get all bookings for this user
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, status, check_out_date')
      .eq('customer_id', userId)
      .eq('accommodation_id', accommodationId)
      .in('status', ['confirmed']);
    
    if (error) {
      console.error('Error checking user booking history:', error);
      return false;
    }
    
    // Check if any booking is for this accommodation, has status 'confirmed',
    // and the stay has already completed (check_out_date in the past)
    const now = new Date();
    const hasCompletedBooking = bookings.some((booking: SimpleBooking) => {
      const checkoutDate = new Date(booking.check_out_date);
      return checkoutDate < now;
    });
    
    return hasCompletedBooking;
  } catch (error) {
    console.error('Error checking user booking history:', error);
    return false;
  }
}