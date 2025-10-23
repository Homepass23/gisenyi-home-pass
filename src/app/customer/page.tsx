'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { Booking } from '../../lib/supabaseHelpers'
import BookingStepper from '../components/features/BookingStepper'

interface BookingWithDetails extends Booking {
  accommodation_title: string;
  accommodation_image_url: string;
}

export default function CustomerDashboard() {
  const { user, signOut, loading: authLoading, refreshUser } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    if (user.role !== 'customer') {
      // Not a customer; do not fetch customer bookings
      setLoading(false)
      return
    }
    // Refresh then fetch
    refreshUser().then(() => {
      fetchBookings()
    })
  }, [authLoading, user?.id, user?.role])

  const fetchBookings = async () => {
    if (!user) {
      console.warn('No user found, cannot fetch bookings')
      setLoading(false)
      return
    }

    console.log('User details:', {
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Check if user has customer role (double-guard)
    if (user.role !== 'customer') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Fetching bookings for user:', user.id)
      
      // Fetch bookings with accommodation details
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations(title)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Customer bookings query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Bookings data fetched:', data)
      
      // Transform data to match the interface
      const transformedBookings = (data || []).map(booking => ({
        ...booking,
        accommodation_title: booking.accommodation?.title || 'Unknown Accommodation',
        accommodation_image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE5NSAxNDVIMjA1VjE1NUgxOTVWMTQ1WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
      }))

      console.log('Transformed bookings:', transformedBookings)
      setBookings(transformedBookings)
    } catch (error: unknown) {
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        console.error('Error fetching bookings:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
      } else {
        console.error('Error fetching bookings:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name}</span>
              <button 
                onClick={signOut}
                className="bg-white text-sky-600 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <BookingStepper currentStep={4} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Bookings</h2>
                  <Link href="/accommodations" className="text-sky-600 hover:underline text-sm">
                    Book New Accommodation
                  </Link>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your bookings...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 p-4 rounded-md">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{booking.accommodation_title}</h3>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">
                          <strong>Dates:</strong> {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Guests:</strong> {booking.num_of_guests} guest{booking.num_of_guests !== 1 ? 's' : ''}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Booking Date:</strong> {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You have not made any bookings yet.</p>
                    <Link 
                      href="/accommodations" 
                      className="mt-4 inline-block bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
                    >
                      Browse Accommodations
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
