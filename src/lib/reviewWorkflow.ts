import { createNewReview, canUserReviewAccommodation } from './reviewHelpers'
import { getAccommodationById } from './supabaseHelpers'
import { Review } from './supabaseHelpers'

/**
 * Complete review workflow - from validation to creation
 */
export async function completeReviewWorkflow(reviewData: Partial<Review>) {
  try {
    // Step 1: Validate review data
    const validation = validateReviewData(reviewData)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }
    
    // Step 2: Check if user can review this accommodation
    const canReview = await canUserReviewAccommodation(
      reviewData.customer_id!,
      reviewData.accommodation_id!
    )
    
    if (!canReview) {
      throw new Error('You are not eligible to review this accommodation')
    }
    
    // Step 3: Create the review
    const review = await createNewReview(reviewData)
    
    // Step 4: Get accommodation and user details for notifications (commented out for now)
    // const accommodation = await getAccommodationById(reviewData.accommodation_id!)
    // const customer = await getUserById(reviewData.customer_id!)
    
    // Step 5: Send notification (in a real app)
    // TODO: Implement notification system
    
    return {
      success: true,
      review: review[0],
      message: 'Review submitted successfully.'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: 'Failed to submit review'
    }
  }
}

/**
 * Validate review data before creation
 */
export function validateReviewData(reviewData: Partial<Review>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  if (!reviewData.accommodation_id) {
    errors.push('Accommodation is required')
  }
  
  if (!reviewData.customer_id) {
    errors.push('Customer ID is required')
  }
  
  if (!reviewData.rating) {
    errors.push('Rating is required')
  } else if (reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Rating must be between 1 and 5')
  }
  
  if (!reviewData.comment) {
    errors.push('Comment is required')
  } else if (reviewData.comment.length < 10) {
    errors.push('Comment must be at least 10 characters long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get reviews for an accommodation with formatted data
 */
export async function getFormattedAccommodationReviews(accommodationId: string) {
  try {
    // Get accommodation details
    const accommodation = await getAccommodationById(accommodationId)
    
    if (!accommodation) {
      throw new Error('Accommodation not found')
    }
    
    // In a real implementation, you would get reviews from the database
    // For now, we'll return mock data for testing
    return {
      success: true,
      accommodation: {
        id: accommodation.id,
        title: accommodation.title,
        rating: accommodation.rating
      },
      reviews: [],
      averageRating: accommodation.rating,
      totalReviews: 0
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: 'Failed to fetch reviews'
    }
  }
}

/**
 * Check if a user can add a review for an accommodation
 */
export async function checkReviewEligibility(userId: string, accommodationId: string) {
  try {
    // Check if user can review this accommodation
    const canReview = await canUserReviewAccommodation(userId, accommodationId)
    
    return {
      success: true,
      canReview,
      message: canReview 
        ? 'You are eligible to review this accommodation' 
        : 'You are not eligible to review this accommodation'
    }
  } catch (error) {
    return {
      success: false,
      canReview: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      message: 'Failed to check review eligibility'
    }
  }
}