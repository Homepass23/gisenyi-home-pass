import { createNewReview, canUserReviewAccommodation } from '../lib/newReviewHelpers'
import * as supabaseHelpers from '../lib/supabaseHelpers'
import { Review } from '../lib/supabaseHelpers'

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}

const mockSupabaseAdmin = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}

jest.mock('../lib/supabaseClient', () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabaseAdmin
}))

jest.mock('../lib/supabaseHelpers', () => ({
  createReview: jest.fn(),
  getReviewsByAccommodationId: jest.fn(),
  calculateAccommodationRating: jest.fn(),
  updateAccommodationRating: jest.fn(),
  getBookingsByUserId: jest.fn(),
  getUserById: jest.fn()
}))

describe('New Review Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createNewReview', () => {
    it('should successfully create a review', async () => {
      // Mock the user data
      (supabaseHelpers.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        full_name: 'John Doe',
        profile_image_url: 'https://example.com/image.jpg',
        email: 'john@example.com'
      })

      // Mock the bookings data
      (supabaseHelpers.getBookingsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 'booking-123',
          accommodation_id: 'accommodation-123',
          status: 'confirmed'
        }
      ])

      const mockReviewData: Review = {
        id: 'review-123',
        accommodation_id: 'accommodation-123',
        customer_id: 'user-123',
        rating: 5,
        comment: 'Great stay!',
        reviewer_name: 'John Doe',
        reviewer_image_url: 'https://example.com/image.jpg',
        booking_id: 'booking-123',
        created_at: new Date().toISOString()
      }

      // Mock the review creation
      ;(supabaseHelpers.createReview as jest.Mock).mockResolvedValue([mockReviewData])

      // Mock the accommodation rating update
      ;(supabaseHelpers.updateAccommodationRating as jest.Mock).mockResolvedValue(undefined)

      const result = await createNewReview({
        accommodation_id: 'accommodation-123',
        rating: 5,
        comment: 'Great stay!'
      }, 'user-123')

      expect(result).toEqual([mockReviewData])
      expect(supabaseHelpers.createReview).toHaveBeenCalledWith({
        accommodation_id: 'accommodation-123',
        rating: 5,
        comment: 'Great stay!',
        customer_id: 'user-123',
        reviewer_name: 'John Doe',
        reviewer_image_url: 'https://example.com/image.jpg',
        booking_id: 'booking-123',
        created_at: expect.any(String)
      })
    })

    it('should handle validation errors', async () => {
      // Mock the user data
      (supabaseHelpers.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        full_name: 'John Doe',
        profile_image_url: 'https://example.com/image.jpg',
        email: 'john@example.com'
      })

      // Mock the review eligibility check
      ;(supabaseHelpers.getBookingsByUserId as jest.Mock).mockResolvedValue([
        {
          accommodation_id: 'accommodation-123',
          status: 'confirmed'
        }
      ])

      await expect(
        createNewReview({
          accommodation_id: 'accommodation-123',
          rating: 6,
          comment: 'Great stay!'
        }, 'user-123')
      ).rejects.toThrow('Rating must be between 1 and 5')
    })
  })

  describe('canUserReviewAccommodation', () => {
    it('should return true for users with completed bookings', async () => {
      // Mock the bookings fetch
      ;(supabaseHelpers.getBookingsByUserId as jest.Mock).mockResolvedValue([
        {
          accommodation_id: 'accommodation-123',
          status: 'confirmed'
        }
      ])

      const result = await canUserReviewAccommodation('user-123', 'accommodation-123')

      expect(result).toBe(true)
    })

    it('should return false for users without completed bookings', async () => {
      // Mock the bookings fetch
      ;(supabaseHelpers.getBookingsByUserId as jest.Mock).mockResolvedValue([
        {
          accommodation_id: 'other-accommodation-123',
          status: 'confirmed'
        }
      ])

      const result = await canUserReviewAccommodation('user-123', 'accommodation-123')

      expect(result).toBe(false)
    })
  })
})