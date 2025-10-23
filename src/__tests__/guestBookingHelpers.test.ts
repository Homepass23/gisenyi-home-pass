import { validateGuestBookingData } from '../lib/guestBookingHelpers'

describe('Guest Booking Helpers', () => {
  describe('validateGuestBookingData', () => {
    it('should validate a complete guest booking', () => {
      const bookingData = {
        accommodation_id: 'acc-123',
        check_in_date: '2025-12-01',
        check_out_date: '2025-12-05',
        num_of_guests: 2,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        city: 'New York'
      }
      
      const result = validateGuestBookingData(bookingData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('should reject booking with missing required fields', () => {
      const bookingData = {
        check_in_date: '2025-12-01',
        check_out_date: '2025-12-05'
      }
      
      const result = validateGuestBookingData(bookingData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Accommodation is required')
      expect(result.errors).toContain('Number of guests is required and must be greater than 0')
      expect(result.errors).toContain('Full name is required')
      expect(result.errors).toContain('Email is required')
      expect(result.errors).toContain('Phone number is required')
      expect(result.errors).toContain('City is required')
    })
    
    it('should reject booking with invalid dates', () => {
      const bookingData = {
        accommodation_id: 'acc-123',
        check_in_date: '2020-12-01', // Past date
        check_out_date: '2025-12-05',
        num_of_guests: 2,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        city: 'New York'
      }
      
      const result = validateGuestBookingData(bookingData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Check-in date cannot be in the past')
    })
    
    it('should reject booking with checkout before checkin', () => {
      const bookingData = {
        accommodation_id: 'acc-123',
        check_in_date: '2025-12-05',
        check_out_date: '2025-12-01', // Before checkin
        num_of_guests: 2,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        city: 'New York'
      }
      
      const result = validateGuestBookingData(bookingData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Check-out date must be after check-in date')
    })
  })
})