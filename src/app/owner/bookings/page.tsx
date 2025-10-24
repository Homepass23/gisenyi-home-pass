'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { supabase } from '../../../lib/supabaseClient'
import { Booking, Accommodation, User } from '../../../lib/supabaseHelpers'

interface BookingWithAccommodationAndCustomer extends Booking {
  accommodation?: Accommodation;
  customer?: User;
}

interface CustomerDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
}

interface OwnerBookingRow {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestAddress: string
  accommodationTitle: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice: number
}

export default function OwnerBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<OwnerBookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const fetchInProgress = useRef(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (id: string, status: 'confirmed' | 'rejected' | 'cancelled') => {
    try {
      setUpdatingId(id)
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      const res = await fetch(`/api/owner/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) {
        throw new Error('Failed to update')
      }
    } catch (e) {
      // Revert by refetching list
      await refetch()
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const refetch = async () => {
    if (!user?.id) return
    if (fetchInProgress.current) return
    fetchInProgress.current = true
    try {
      setLoading(true)
      
      // Fetch bookings with related data
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations(title, price_per_night, owner_id),
          customer:users!left(full_name, email, phone_number, street_address, city)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Fetch customer details for each booking (for guest bookings where customer_id might be null)
      const customerIds = [...new Set(data?.map(b => b.customer_id).filter(id => id) || [])] as string[];
      let customerDetails: Record<string, CustomerDetails> = {};
      
      if (customerIds.length > 0) {
        const { data: customersData, error: customersError } = await supabase
          .from('users')
          .select('id, full_name, email, phone_number, street_address, city')
          .in('id', customerIds);
        
        if (!customersError && customersData) {
          customerDetails = customersData.reduce((acc, customer) => {
            acc[customer.id] = customer;
            return acc;
          }, {} as Record<string, CustomerDetails>);
        }
      }
      
      const ownerBookings = (data || [])
        .filter((b: BookingWithAccommodationAndCustomer) => b.accommodation?.owner_id === user.id)
        .map((b: BookingWithAccommodationAndCustomer) => {
          const checkIn = new Date(b.check_in_date)
          const checkOut = new Date(b.check_out_date)
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          const price = b.accommodation?.price_per_night || 0
          
          // Get guest info - prioritize authenticated user data, fallback to booking data
          // If customer_id exists, get info from users table, otherwise use booking data
          let guestName, guestEmail, guestPhone, guestStreetAddress, guestCity;
          
          if (b.customer_id && customerDetails[b.customer_id]) {
            // Use customer data from users table
            const customer = customerDetails[b.customer_id];
            guestName = customer.full_name || 'Unknown Guest';
            guestEmail = customer.email || 'N/A';
            guestPhone = customer.phone_number || 'N/A';
            guestStreetAddress = customer.street_address || 'N/A';
            guestCity = customer.city || 'N/A';
          } else if (b.customer?.full_name) {
            // Use customer data from the join
            guestName = b.customer.full_name;
            guestEmail = b.customer.email || 'N/A';
            guestPhone = 'N/A';
            guestStreetAddress = 'N/A';
            guestCity = 'N/A';
          } else {
            // Fallback to booking data
            guestName = b.full_name || 'Unknown Guest';
            guestEmail = b.email || 'N/A';
            guestPhone = b.phone_number || 'N/A';
            guestStreetAddress = b.street_address || 'N/A';
            guestCity = b.city || 'N/A';
          }
          
          const guestAddress = `${guestStreetAddress}, ${guestCity}`;
          
          return {
            id: b.id,
            guestName,
            guestEmail,
            guestPhone,
            guestAddress,
            accommodationTitle: b.accommodation?.title || 'Unknown Accommodation',
            checkIn: b.check_in_date,
            checkOut: b.check_out_date,
            status: b.status,
            totalPrice: nights * price
          } as OwnerBookingRow
        })
      setBookings(ownerBookings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      fetchInProgress.current = false
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

  useEffect(() => {
    if (!user?.id) return
    
    // Prevent multiple simultaneous fetch operations
    if (fetchInProgress.current) return
    fetchInProgress.current = true
    
    const fetch = async () => {
      try {
        setLoading(true)
        
        // Fetch bookings with related data
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            accommodation:accommodations(title, price_per_night, owner_id),
            customer:users!left(full_name, email, phone_number, street_address, city)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Owner bookings query error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }
        
        // Fetch customer details for each booking (for guest bookings where customer_id might be null)
        const customerIds = [...new Set(data?.map(b => b.customer_id).filter(id => id) || [])] as string[];
        let customerDetails: Record<string, CustomerDetails> = {};
        
        if (customerIds.length > 0) {
          const { data: customersData, error: customersError } = await supabase
            .from('users')
            .select('id, full_name, email, phone_number, street_address, city')
            .in('id', customerIds);
          
          if (!customersError && customersData) {
            customerDetails = customersData.reduce((acc, customer) => {
              acc[customer.id] = customer;
              return acc;
            }, {} as Record<string, CustomerDetails>);
          }
        }
        
        const ownerBookings = (data || [])
          .filter((b: BookingWithAccommodationAndCustomer) => b.accommodation?.owner_id === user.id)
          .map((b: BookingWithAccommodationAndCustomer) => {
            const checkIn = new Date(b.check_in_date)
            const checkOut = new Date(b.check_out_date)
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            const price = b.accommodation?.price_per_night || 0
            
            // Get guest info - prioritize authenticated user data, fallback to booking data
            // If customer_id exists, get info from users table, otherwise use booking data
            let guestName, guestEmail, guestPhone, guestStreetAddress, guestCity;
            
            if (b.customer_id && customerDetails[b.customer_id]) {
              // Use customer data from users table
              const customer = customerDetails[b.customer_id];
              guestName = customer.full_name || 'Unknown Guest';
              guestEmail = customer.email || 'N/A';
              guestPhone = customer.phone_number || 'N/A';
              guestStreetAddress = customer.street_address || 'N/A';
              guestCity = customer.city || 'N/A';
            } else if (b.customer?.full_name) {
              // Use customer data from the join
              guestName = b.customer.full_name;
              guestEmail = b.customer.email || 'N/A';
              guestPhone = 'N/A';
              guestStreetAddress = 'N/A';
              guestCity = 'N/A';
            } else {
              // Fallback to booking data
              guestName = b.full_name || 'Unknown Guest';
              guestEmail = b.email || 'N/A';
              guestPhone = b.phone_number || 'N/A';
              guestStreetAddress = b.street_address || 'N/A';
              guestCity = b.city || 'N/A';
            }
            
            const guestAddress = `${guestStreetAddress}, ${guestCity}`;
            
            return {
              id: b.id,
              guestName,
              guestEmail,
              guestPhone,
              guestAddress,
              accommodationTitle: b.accommodation?.title || 'Unknown Accommodation',
              checkIn: b.check_in_date,
              checkOut: b.check_out_date,
              status: b.status,
              totalPrice: nights * price
            } as OwnerBookingRow
          })

        setBookings(ownerBookings)
      } catch (error: unknown) {
        // Type guard to check if error is an Error object
        if (error instanceof Error) {
          console.error('Failed to load owner bookings:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        } else {
          console.error('Failed to load owner bookings:', error)
        }
      } finally {
        setLoading(false)
        fetchInProgress.current = false
      }
    }
    
    fetch()
    
    // Cleanup function
    return () => {
      fetchInProgress.current = false
    }
  }, [user?.id]) // Depend on user ID instead of entire user object

  return (
    <ProtectedRoute requiredRole="host">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name}</span>
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Booking Requests</h2>
                  <p className="text-gray-600">Bookings for your accommodations</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Contact & Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accommodation</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">Loading...</td>
                        </tr>
                      ) : bookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">No bookings found</td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                              <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>Phone: {booking.guestPhone}</div>
                              <div>Address: {booking.guestAddress}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.accommodationTitle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.checkIn} to {booking.checkOut}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rwf {booking.totalPrice.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    disabled={updatingId === booking.id}
                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                    className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {updatingId === booking.id ? 'Saving...' : 'Confirm'}
                                  </button>
                                  <button
                                    disabled={updatingId === booking.id}
                                    onClick={() => updateStatus(booking.id, 'rejected')}
                                    className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {updatingId === booking.id ? 'Saving...' : 'Reject'}
                                  </button>
                                </div>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  disabled={updatingId === booking.id}
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {updatingId === booking.id ? 'Saving...' : 'Cancel'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}