'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { supabase } from '../../lib/supabaseClient'
import { Accommodation, Booking } from '../../lib/supabaseHelpers'

interface BookingWithAccommodation extends Booking {
  accommodation_title: string;
}

export default function OwnerDashboard() {
  const { user, signOut } = useAuth()
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [bookings, setBookings] = useState<BookingWithAccommodation[]>([])
  const [loadingAccommodations, setLoadingAccommodations] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    if (!user) return
    
    fetchAccommodations()
    fetchBookings()
  }, [user])

  const fetchAccommodations = async () => {
    try {
      setLoadingAccommodations(true)
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .eq('owner_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccommodations(data || [])
    } catch (e) {
      console.error('Failed to load accommodations', e)
    } finally {
      setLoadingAccommodations(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match the interface
      const transformedBookings = (data || []).map(booking => ({
        ...booking,
        accommodation_title: booking.accommodation?.title || 'Unknown Accommodation'
      }))

      setBookings(transformedBookings)
    } catch (e) {
      console.error('Failed to load bookings', e)
    } finally {
      setLoadingBookings(false)
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
    <ProtectedRoute requiredRole="host">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Owner Dashboard</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">My Accommodations</h2>
                  {loadingAccommodations ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600 text-sm">Loading accommodations...</p>
                    </div>
                  ) : accommodations.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {accommodations.map((acc) => (
                        <div key={acc.id} className="border border-gray-200 p-3 rounded-md">
                          <h3 className="font-medium">{acc.title}</h3>
                          <p className="text-gray-600 text-sm">{acc.location}</p>
                          <p className="text-gray-600 text-sm">Rwf {acc.price_per_night?.toLocaleString() || 'N/A'}/night</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">You have not listed any accommodations yet.</p>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                  {loadingBookings ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600 text-sm">Loading bookings...</p>
                    </div>
                  ) : bookings.filter(b => 
                    accommodations.some(acc => acc.id === b.accommodation_id)
                  ).slice(0, 5).length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {bookings.filter(b => 
                        accommodations.some(acc => acc.id === b.accommodation_id)
                      ).slice(0, 5).map((booking) => (
                        <div key={booking.id} className="border border-gray-200 p-3 rounded-md">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-sm">{booking.accommodation_title}</h3>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 text-xs">
                            Guest: {booking.full_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">You do not have any bookings yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}