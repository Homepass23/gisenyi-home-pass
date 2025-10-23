import { 
  createReview, 
  getReviewsByAccommodationId,
  calculateAccommodationRating,
  updateAccommodationRating,
  getBookingsByUserId,
  getUserById
} from './supabaseHelpers'
import { Review } from './supabaseHelpers'

/**
 * Create a new review with validation and authentication
 */
export async function createNewReview(reviewData: Partial<Review>, userId: string) {
  // Validate required fields
  if (!reviewData.accommodation_id) {
    throw new Error('Accommodation ID is required')
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  // Check if user has completed booking for this accommodation (past confirmed booking)
  const canReview = await canUserReviewAccommodation(userId, reviewData.accommodation_id)
  if (!canReview) {
    throw new Error('You can only review accommodations you have stayed at')
  }
  
  // Get user details to populate reviewer name
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found')
  }
  
  // Find the booking that this review is for
  const bookings = await getBookingsByUserId(userId);
  const relevantBooking = bookings.find(booking => 
    booking.accommodation_id === reviewData.accommodation_id && 
    booking.status === 'confirmed'
  );
  
  // Add user ID and attempt to associate to a matching booking
  const fullReviewData = {
    ...reviewData,
    customer_id: userId,
    reviewer_name: user.full_name || 'Anonymous User',
    reviewer_image_url: user.profile_image_url || null,
    booking_id: relevantBooking ? relevantBooking.id : null,
    created_at: new Date().toISOString()
  } as Partial<Review>
  
  // Create the review
  const review = await createReview(fullReviewData)
  
  // Update accommodation rating
  await updateAccommodationRating(reviewData.accommodation_id)
  
  return review
}

/**
 * Get reviews for an accommodation with calculated statistics
 */
export async function getAccommodationReviewsWithStats(accommodationId: string) {
  const reviews = await getReviewsByAccommodationId(accommodationId)
  
  if (reviews.length === 0) {
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    }
  }
  
  const averageRating = await calculateAccommodationRating(accommodationId)
  const totalReviews = reviews.length
  
  return {
    reviews,
    averageRating,
    totalReviews
  }
}

/**
 * Check if a user can review an accommodation
 * A user can only review if they have a completed booking for that accommodation
 */
export async function canUserReviewAccommodation(userId: string, accommodationId: string): Promise<boolean> {
  try {
    // Get all bookings for this user
    const bookings = await getBookingsByUserId(userId)
    
    // Check if any booking is for this accommodation, has status 'confirmed',
    // and the stay has already completed (check_out_date in the past)
    const now = new Date()
    const hasCompletedBooking = bookings.some(booking => {
      if (booking.accommodation_id !== accommodationId) return false
      if (booking.status !== 'confirmed') return false
      const checkout = new Date(booking.check_out_date)
      return checkout.getTime() <= now.getTime()
    })
    
    return hasCompletedBooking
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    // On error, do not allow review
    return false
  }
}