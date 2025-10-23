import { createNewBooking, cancelBooking } from '../lib/newBookingHelpers'
import * as supabaseHelpers from '../lib/supabaseHelpers'

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
  createBooking: jest.fn(),
  getBookingsByUserId: jest.fn(),
  getBookingsByAccommodationId: jest.fn(),
  updateBookingStatus: jest.fn()
}))

describe('New Booking Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createNewBooking', () => {
    it('should successfully create a booking', async () => {
      const mockBookingData = {
        id: 'booking-123',
        accommodation_id: 'accommodation-123',
        customer_id: 'user-123',
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      (supabaseHelpers.createBooking as jest.Mock).mockResolvedValue([mockBookingData])

      const result = await createNewBooking({
        accommodation_id: 'accommodation-123',
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05'
      }, 'user-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockBookingData])
      expect(createBooking).toHaveBeenCalledWith({
        accommodation_id: 'accommodation-123',
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05',
        customer_id: 'user-123',
        status: 'pending',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    })

    it('should handle validation errors', async () => {
      const result = await createNewBooking({
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05'
      }, 'user-123')

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Accommodation ID is required')
    })
  })

  describe('cancelBooking', () => {
    it('should successfully cancel a booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        customer_id: 'user-123',
        status: 'pending'
      }

      // Mock the booking fetch
      mockSupabase.select.mockReturnValue(mockSupabase)
      mockSupabase.eq.mockReturnValue(mockSupabase)
      mockSupabase.single.mockResolvedValue({ data: mockBooking, error: null })

      // Mock the booking update
      (supabaseHelpers.updateBookingStatus as jest.Mock).mockResolvedValue([{ ...mockBooking, status: 'cancelled' }])

      const result = await cancelBooking('booking-123', 'user-123')

      expect(result.error).toBeNull()
      expect(updateBookingStatus).toHaveBeenCalledWith('booking-123', 'cancelled')
    })

    it('should prevent users from cancelling other users\' bookings', async () => {
      const mockBooking = {
        id: 'booking-123',
        customer_id: 'other-user-123',
        status: 'pending'
      }

      // Mock the booking fetch
      mockSupabase.select.mockReturnValue(mockSupabase)
      mockSupabase.eq.mockReturnValue(mockSupabase)
      mockSupabase.single.mockResolvedValue({ data: mockBooking, error: null })

      const result = await cancelBooking('booking-123', 'user-123')

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Unauthorized: You can only cancel your own bookings')
    })
  })
})