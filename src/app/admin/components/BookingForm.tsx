'use client'

import React, { useState, useEffect } from 'react'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import { Booking } from '../../../lib/supabaseHelpers'

interface CustomerDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
}

interface BookingFormProps {
  booking?: Booking | null
  onSubmit: (data: Partial<Booking>) => Promise<void>
  onCancel: () => void
}

export default function BookingForm({ booking, onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({
    accommodation_id: '',
    room_id: null,
    customer_id: null,
    full_name: '',
    email: '',
    phone_number: '',
    street_address: '',
    city: '',
    check_in_date: '',
    check_out_date: '',
    num_of_guests: 1,
    status: 'pending',
    cancellation_requested: false,
    cancellation_reason: '',
    ...booking
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)

  useEffect(() => {
    if (booking) {
      setFormData(booking)
      // If the booking has a customer_id, fetch customer details
      if (booking.customer_id) {
        fetchCustomerDetails(booking.customer_id)
      }
    }
  }, [booking])

  const fetchCustomerDetails = async (customerId: string) => {
    if (!customerId) return
    
    try {
      // Fetch customer details from users table
      const { data: customerData, error: customerError } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, phone_number, street_address, city')
        .eq('id', customerId)
        .single()
      
      if (customerError) {
        console.error('Error fetching customer details:', customerError)
        return
      }
      
      if (customerData) {
        setCustomerDetails(customerData)
        
        // Update form data with customer details if they're not already set
        setFormData(prev => ({
          ...prev,
          full_name: prev.full_name || customerData.full_name || '',
          email: prev.email || customerData.email || '',
          phone_number: prev.phone_number || customerData.phone_number || '',
          street_address: prev.street_address || customerData.street_address || '',
          city: prev.city || customerData.city || ''
        }))
      }
    } catch (err) {
      console.error('Error fetching customer details:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.phone_number || 
        !formData.city || !formData.check_in_date || !formData.check_out_date || 
        !formData.num_of_guests || formData.num_of_guests <= 0) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }
    
    // Validate dates
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date)
      const checkOut = new Date(formData.check_out_date)
      
      if (checkOut <= checkIn) {
        setError('Check-out date must be after check-in date.')
        setLoading(false)
        return
      }
    }
    
    try {
      console.log('Submitting form data:', formData);
      await onSubmit(formData)
      onCancel()
    } catch (err) {
      console.error('Error in form submission:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the booking';
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {customerDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> {customerDetails.full_name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {customerDetails.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {customerDetails.phone_number}
            </div>
            <div>
              <span className="font-medium">Address:</span> {customerDetails.street_address}, {customerDetails.city}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          id="street_address"
          name="street_address"
          value={formData.street_address || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="check_in_date" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date *
          </label>
          <input
            type="date"
            id="check_in_date"
            name="check_in_date"
            value={formData.check_in_date || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="check_out_date" className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date *
          </label>
          <input
            type="date"
            id="check_out_date"
            name="check_out_date"
            value={formData.check_out_date || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="num_of_guests" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests *
          </label>
          <input
            type="number"
            id="num_of_guests"
            name="num_of_guests"
            value={formData.num_of_guests || 1}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'pending'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {formData.status === 'cancelled' && (
        <div>
          <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-1">
            Cancellation Reason
          </label>
          <textarea
            id="cancellation_reason"
            name="cancellation_reason"
            value={formData.cancellation_reason || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      )}
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="cancellation_requested"
          name="cancellation_requested"
          checked={formData.cancellation_requested || false}
          onChange={handleChange}
          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
        />
        <label htmlFor="cancellation_requested" className="ml-2 block text-sm text-gray-700">
          Cancellation Requested
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  )
}