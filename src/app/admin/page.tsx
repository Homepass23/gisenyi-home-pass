'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { 
  Users, 
  Home, 
  Calendar, 
  BarChart3, 
  Mail, 
  Plus,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'
import AdminNavigation from './components/AdminNavigation'
import { supabaseAdmin } from '../../lib/supabaseClient'
import Modal from '../components/shared/Modal'
import AccommodationForm from './components/AccommodationForm'
import UserForm from './components/UserForm'
import BookingForm from './components/BookingForm'
import { Accommodation, User, Booking } from '../../lib/supabaseHelpers'

interface BookingWithDetails extends Booking {
  guestName: string;
  accommodationTitle: string;
}

interface AccommodationWithStats extends Accommodation {
  bookingCount: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccommodations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    revenue: 0
  })
  const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>([])
  const [topAccommodations, setTopAccommodations] = useState<AccommodationWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [accommodationsLoading, setAccommodationsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'accommodation' | 'user' | 'booking' | null>(null)

  useEffect(() => {
    fetchStats()
    fetchRecentBookings()
    fetchTopAccommodations()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError
      
      // Fetch total accommodations
      const { count: totalAccommodations, error: accommodationsError } = await supabaseAdmin
        .from('accommodations')
        .select('*', { count: 'exact', head: true })
      
      if (accommodationsError) throw accommodationsError
      
      // Fetch total bookings
      const { count: totalBookings, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
      
      if (bookingsError) throw bookingsError
      
      // Fetch pending bookings
      const { count: pendingBookings, error: pendingError } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      if (pendingError) throw pendingError
      
      // Fetch confirmed bookings
      const { count: confirmedBookings, error: confirmedError } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')
      
      if (confirmedError) throw confirmedError
      
      // Calculate revenue (sum of confirmed booking prices)
      let revenue = 0
      const { data: confirmedBookingsData, error: revenueError } = await supabaseAdmin
        .from('bookings')
        .select('accommodation_id')
        .eq('status', 'confirmed')
      
      if (revenueError) throw revenueError
      
      if (confirmedBookingsData && confirmedBookingsData.length > 0) {
        const accommodationIds = confirmedBookingsData.map(booking => booking.accommodation_id)
        const { data: accommodationsData, error: accommodationsError } = await supabaseAdmin
          .from('accommodations')
          .select('price_per_night')
          .in('id', accommodationIds)
        
        if (accommodationsError) throw accommodationsError
        
        if (accommodationsData) {
          revenue = accommodationsData.reduce((sum, acc) => sum + parseFloat(acc.price_per_night.toString()), 0)
        }
      }
      
      setStats({
        totalUsers: totalUsers || 0,
        totalAccommodations: totalAccommodations || 0,
        totalBookings: totalBookings || 0,
        pendingBookings: pendingBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        revenue: revenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      setBookingsLoading(true)
      
      // Fetch recent bookings with related data
      const { data: bookingsData, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations(title),
          customer:users(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (bookingsError) {
        console.error('Recent bookings query error:', bookingsError)
        throw bookingsError
      }
      
      // Transform data to match the interface
      const transformedBookings = bookingsData?.map(booking => ({
        ...booking,
        guestName: booking.customer?.full_name || 'Unknown Guest',
        accommodationTitle: booking.accommodation?.title || 'Unknown Accommodation'
      })) || []
      
      setRecentBookings(transformedBookings)
    } catch (error) {
      console.error('Error fetching recent bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchTopAccommodations = async () => {
    try {
      setAccommodationsLoading(true)
      
      // Fetch accommodations with booking counts and revenue
      const { data: accommodationsData, error: accommodationsError } = await supabaseAdmin
        .from('accommodations')
        .select('*')
        .order('rating', { ascending: false })
        .limit(5)
      
      if (accommodationsError) throw accommodationsError
      
      // For each accommodation, get booking count and revenue
      const accommodationsWithStats = await Promise.all(
        accommodationsData.map(async (acc) => {
          // Get booking count for this accommodation
          const { count: bookingCount, error: countError } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('accommodation_id', acc.id)
          
          if (countError) throw countError
          
          // Calculate total revenue (confirmed bookings only)
          const { data: confirmedBookings, error: revenueError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('status', 'confirmed')
          
          if (revenueError) throw revenueError
          
          const totalRevenue = confirmedBookings?.length ? 
            confirmedBookings.length * parseFloat(acc.price_per_night.toString()) : 0
          
          return {
            ...acc,
            bookingCount: bookingCount || 0,
            totalRevenue
          }
        })
      )
      
      setTopAccommodations(accommodationsWithStats)
    } catch (error) {
      console.error('Error fetching top accommodations:', error)
    } finally {
      setAccommodationsLoading(false)
    }
  }

  const handleQuickCreate = (type: 'accommodation' | 'user' | 'booking') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleSaveAccommodation = async (data: Partial<Accommodation>) => {
    try {
      const { error } = await supabaseAdmin
        .from('accommodations')
        .insert({ ...data, owner_id: user?.id || '' })
      
      if (error) throw error
      
      // Refresh stats
      fetchStats()
      fetchTopAccommodations()
    } catch (error) {
      console.error('Error creating accommodation:', error)
      throw error
    }
  }

  const handleSaveUser = async (data: Partial<User>) => {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .insert(data)
      
      if (error) throw error
      
      // Refresh stats
      fetchStats()
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const handleSaveBooking = async (data: Partial<Booking>) => {
    try {
      const { error } = await supabaseAdmin
        .from('bookings')
        .insert(data)
      
      if (error) throw error
      
      // Refresh stats
      fetchStats()
      fetchRecentBookings()
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
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
    <ProtectedRoute requiredRole="admin">
      <div className="mt-21 flex min-h-screen bg-gray-50">
        <AdminNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-sky-600 text-white p-4 shadow-md">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span>Welcome, {user?.full_name || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <Users className="h-10 w-10 text-sky-600 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <Home className="h-10 w-10 text-sky-600 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Accommodations</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalAccommodations}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <Calendar className="h-10 w-10 text-sky-600 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.totalBookings}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <BarChart3 className="h-10 w-10 text-sky-600 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Revenue (RWF)</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings and Top Accommodations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Bookings */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-sky-600 mr-2" />
                    <h2 className="text-xl font-semibold">Recent Bookings</h2>
                  </div>
                  <Link 
                    href="/admin/bookings" 
                    className="flex items-center text-sky-600 hover:text-sky-800 text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Link>
                </div>
                
                {bookingsLoading ? (
                  <p className="text-gray-500">Loading recent bookings...</p>
                ) : recentBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Accommodation
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.guestName}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {booking.accommodationTitle}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent bookings</p>
                )}
              </div>

              {/* Top Accommodations */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Home className="h-6 w-6 text-sky-600 mr-2" />
                    <h2 className="text-xl font-semibold">Top Accommodations</h2>
                  </div>
                  <Link 
                    href="/admin/accommodations" 
                    className="flex items-center text-sky-600 hover:text-sky-800 text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Link>
                </div>
                
                {accommodationsLoading ? (
                  <p className="text-gray-500">Loading top accommodations...</p>
                ) : topAccommodations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topAccommodations.map((accommodation) => (
                          <tr key={accommodation.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {accommodation.title}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {accommodation.bookingCount}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              Rwf {accommodation.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No accommodations found</p>
                )}
              </div>
            </div>

            {/* Booking Management */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-sky-600 mr-2" />
                  <h2 className="text-xl font-semibold">Booking Management</h2>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleQuickCreate('booking')}
                    className="flex items-center bg-sky-600 text-white px-3 py-1.5 rounded-md hover:bg-sky-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Booking
                  </button>
                  <Link 
                    href="/admin/bookings" 
                    className="flex items-center bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Pending</p>
                      <p className="text-xl font-bold">{loading ? '...' : stats.pendingBookings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Confirmed</p>
                      <p className="text-xl font-bold">{loading ? '...' : stats.confirmedBookings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Cancelled/Rejected</p>
                      <p className="text-xl font-bold">{loading ? '...' : (stats.totalBookings - stats.pendingBookings - stats.confirmedBookings)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600">Manage all booking requests and view booking statistics</p>
            </div>

            {/* Main Functionality Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Accommodations Management */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Home className="h-6 w-6 text-sky-600 mr-2" />
                  <h2 className="text-xl font-semibold">Accommodations</h2>
                </div>
                <p className="text-gray-600 mb-4">Manage all accommodations and rooms</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleQuickCreate('accommodation')}
                    className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </button>
                  <Link 
                    href="/admin/accommodations" 
                    className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </div>
              </div>

              {/* User Management */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-sky-600 mr-2" />
                  <h2 className="text-xl font-semibold">User Management</h2>
                </div>
                <p className="text-gray-600 mb-4">Manage users, hosts, and customers</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleQuickCreate('user')}
                    className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                  <Link 
                    href="/admin/users" 
                    className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </div>
              </div>

              {/* Analytics & Reports */}
              {/* 
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-6 w-6 text-sky-600 mr-2" />
                  <h2 className="text-xl font-semibold">Analytics & Reports</h2>
                </div>
                <p className="text-gray-600 mb-4">View business analytics and reports</p>
                <div className="flex space-x-3">
                  <Link 
                    href="/admin/analytics" 
                    className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                  >
                    View Reports
                  </Link>
                </div>
              </div>
              */}

              {/* Customer Inquiries */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-sky-600 mr-2" />
                  <h2 className="text-xl font-semibold">Customer Inquiries</h2>
                </div>
                <p className="text-gray-600 mb-4">Manage and respond to customer inquiries</p>
                <Link 
                  href="/admin/inquiries" 
                  className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors w-fit"
                >
                  View Inquiries
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Create Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'accommodation' ? 'Create New Accommodation' :
          modalType === 'user' ? 'Create New User' :
          modalType === 'booking' ? 'Create New Booking' : ''
        }
        size="lg"
      >
        {modalType === 'accommodation' && (
          <AccommodationForm
            accommodation={null}
            onSubmit={handleSaveAccommodation}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
        {modalType === 'user' && (
          <UserForm
            user={null}
            onSubmit={handleSaveUser}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
        {modalType === 'booking' && (
          <BookingForm
            booking={null}
            onSubmit={handleSaveBooking}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </ProtectedRoute>
  )
}