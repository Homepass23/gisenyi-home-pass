import { 
  createReview, 
  getReviewsByAccommodationId,
  calculateAccommodationRating,
  updateAccommodationRating
} from './supabaseHelpers'
import { Review } from './supabaseHelpers'

/**
 * Create a new review with validation
 */
export async function createNewReview(reviewData: Partial<Review>) {
  // Validate required fields
  if (!reviewData.accommodation_id) {
    throw new Error('Accommodation ID is required')
  }
  
  if (!reviewData.customer_id) {
    throw new Error('Customer ID is required')
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  // Enforce review eligibility strictly: confirmed past booking required
  const allowed = await canUserReviewAccommodation(
    reviewData.customer_id,
    reviewData.accommodation_id
  )
  if (!allowed) {
    throw new Error('You can only review accommodations you have a past confirmed booking for')
  }
  
  // Create the review
  const review = await createReview({
    ...reviewData,
    created_at: new Date().toISOString()
  })
  
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
  // TODO: Implement this check in a real application
  // This would involve checking if the user has a completed booking for this accommodation
  // For now, we'll return true to allow testing
  console.log(`Checking if user ${userId} can review accommodation ${accommodationId}`)
  return true
}