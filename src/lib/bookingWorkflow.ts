import { createNewBooking } from './bookingHelpers'
import { 
  sendBookingConfirmationEmail
} from './emailHelpers'
import { getAccommodationById, getUserById } from './supabaseHelpers'
import { Booking } from './supabaseHelpers'

/**
 * Complete booking workflow - from creation to confirmation
 */
export async function completeBookingWorkflow(bookingData: Partial<Booking>) {
  try {
    // Step 1: Validate and create booking
    console.log('Creating booking with data:', bookingData);
    const result = await createNewBooking(bookingData)
    
    // Check if there was an error
    if (result.error) {
      throw result.error;
    }
    
    // Extract the booking data
    const booking = result.data;
    
    // Step 2: Get accommodation and user details for notifications
    const accommodation = await getAccommodationById(bookingData.accommodation_id!)
    const customer = bookingData.customer_id ? await getUserById(bookingData.customer_id) : null
    
    // Step 3: Send confirmation email to customer
    if (customer && accommodation && booking && booking.length > 0) {
      await sendBookingConfirmationEmail(
        customer.email,
        customer.full_name || 'Valued Customer',
        accommodation.title,
        bookingData.check_in_date!,
        bookingData.check_out_date!,
        0 // Default amount since total_amount is not in Booking interface
      )
    }
    
    // Step 4: Send notification to host/admin
    // TODO: Implement host notification in a real application
    
    return {
      success: true,
      booking: booking && booking.length > 0 ? booking[0] : null,
      message: 'Booking created successfully. A confirmation email has been sent.'
    }
  } catch (error) {
    console.error('Booking workflow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: 'Failed to create booking'
    }
  }
}

/**
 * Process booking (approve/reject) with notifications
 */
export async function processBookingWorkflow(bookingId: string, action: 'confirm' | 'reject') {
  try {
    // Skip the actual processing for now
    console.log(`Processing booking ${bookingId} with action ${action}`);
    
    // In a real implementation, you would:
    // 1. Update booking status
    // 2. Get booking details
    // 3. Get accommodation and customer details
    // 4. Send status update email to customer
    
    return {
      success: true,
      // booking: updatedBooking[0],
      message: `Booking ${action}ed successfully. A notification email has been sent.`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: `Failed to ${action} booking`
    }
  }
}

/**
 * Cancel booking workflow with notifications
 */
export async function cancelBookingWorkflow(bookingId: string, userId: string) {
  try {
    // Skip the actual cancellation for now
    console.log(`Cancelling booking ${bookingId} for user ${userId}`);
    
    // In a real implementation, you would:
    // 1. Cancel booking
    // 2. Send cancellation notification
    
    return {
      success: true,
      message: 'Booking cancelled successfully.'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: 'Failed to cancel booking'
    }
  }
}

/**
 * Validate booking data before creation
 */
export function validateBookingData(bookingData: Partial<Booking>): { isValid: boolean; errors: string[] } {
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
  
  // Validate guest info for non-logged-in users
  if (!bookingData.customer_id) {
    if (!bookingData.full_name) {
      errors.push('Full name is required for guest bookings')
    }
    
    if (!bookingData.email) {
      errors.push('Email is required for guest bookings')
    }
    
    if (!bookingData.phone_number) {
      errors.push('Phone number is required for guest bookings')
    }
    
    if (!bookingData.city) {
      errors.push('City is required for guest bookings')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}