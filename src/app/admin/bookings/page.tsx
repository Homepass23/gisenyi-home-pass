'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Plus,
  Edit,
  ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import { sendBookingStatusUpdateNotification } from '../../../lib/notificationSystem'
import { Booking } from '../../../lib/supabaseHelpers'
import Modal from '../../components/shared/Modal'
import BookingForm from '../components/BookingForm'

interface BookingWithDetails extends Booking {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestCity: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerCity: string;
  accommodationTitle: string;
  accommodationType: string;
  roomName: string | null;
  totalPrice: number;
}

interface OwnerDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
}

interface CustomerDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
}

export default function AdminBookings() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings with related data - improved query with proper joins
      const { data: bookingsData, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations!inner(title, type, owner_id, price_per_night),
          customer:users!left(full_name, email, phone_number, street_address, city),
          room:accommodation_rooms!left(room_name, price_per_night)
        `)
        .order('created_at', { ascending: false })
      
      if (bookingsError) {
        console.error('Bookings query error:', bookingsError)
        throw bookingsError
      }
      
      // Fetch owner details for each booking
      const ownerIds = [...new Set(bookingsData?.map(b => b.accommodation?.owner_id).filter(id => id) || [])] as string[];
      let ownerDetails: Record<string, OwnerDetails> = {};
      
      if (ownerIds.length > 0) {
        const { data: ownersData, error: ownersError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone_number, street_address, city')
          .in('id', ownerIds);
        
        if (!ownersError && ownersData) {
          ownerDetails = ownersData.reduce((acc, owner) => {
            acc[owner.id] = owner;
            return acc;
          }, {} as Record<string, OwnerDetails>);
        }
      }
      
      // Fetch customer details for each booking (for guest bookings where customer_id might be null)
      const customerIds = [...new Set(bookingsData?.map(b => b.customer_id).filter(id => id) || [])] as string[];
      let customerDetails: Record<string, CustomerDetails> = {};
      
      if (customerIds.length > 0) {
        const { data: customersData, error: customersError } = await supabaseAdmin
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
      
      // Transform data to match the interface
      const transformedBookings = bookingsData?.map(booking => {
        // Calculate total price based on nights
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        // Get accommodation price (room price if room booking, otherwise accommodation price)
        const pricePerNight = booking.room_id && booking.room?.price_per_night 
          ? booking.room.price_per_night 
          : booking.accommodation?.price_per_night || 0;
        
        const totalPrice = nights * pricePerNight;
        
        // Get guest info - prioritize authenticated user data, fallback to booking data
        // If customer_id exists, get info from users table, otherwise use booking data
        let guestName, guestEmail, guestPhone, guestStreetAddress, guestCity;
        
        if (booking.customer_id && customerDetails[booking.customer_id]) {
          // Use customer data from users table
          const customer = customerDetails[booking.customer_id];
          guestName = customer.full_name || 'Unknown Guest';
          guestEmail = customer.email || 'N/A';
          guestPhone = customer.phone_number || 'N/A';
          guestStreetAddress = customer.street_address || 'N/A';
          guestCity = customer.city || 'N/A';
        } else if (booking.customer?.full_name) {
          // Use customer data from the join
          guestName = booking.customer.full_name;
          guestEmail = booking.customer.email || 'N/A';
          guestPhone = 'N/A';
          guestStreetAddress = 'N/A';
          guestCity = 'N/A';
        } else {
          // Fallback to booking data
          guestName = booking.full_name || 'Unknown Guest';
          guestEmail = booking.email || 'N/A';
          guestPhone = booking.phone_number || 'N/A';
          guestStreetAddress = booking.street_address || 'N/A';
          guestCity = booking.city || 'N/A';
        }
        
        const guestAddress = `${guestStreetAddress}, ${guestCity}`;
        
        // Get owner info
        const ownerId = booking.accommodation?.owner_id;
        const owner = ownerId ? ownerDetails[ownerId] : null;
        const ownerName = owner?.full_name || 'Owner Info';
        const ownerEmail = owner?.email || 'N/A';
        const ownerPhone = owner?.phone_number || 'N/A';
        const ownerStreetAddress = owner?.street_address || 'N/A';
        const ownerCity = owner?.city || 'N/A';
        const ownerAddress = `${ownerStreetAddress}, ${ownerCity}`;
        
        return {
          ...booking,
          guestName,
          guestEmail,
          guestPhone,
          guestAddress,
          guestCity,
          ownerName,
          ownerEmail,
          ownerPhone,
          ownerAddress,
          ownerCity,
          accommodationTitle: booking.accommodation?.title || 'Unknown Accommodation',
          accommodationType: booking.accommodation?.type || 'N/A',
          roomName: booking.room?.room_name || null,
          totalPrice: totalPrice
        }
      }) || []
      
      setBookings(transformedBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBooking = () => {
    setEditingBooking(null)
    setIsModalOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setIsModalOpen(true)
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

  const handleBookingAction = async (bookingId: string, status: 'confirmed' | 'rejected' | 'cancelled') => {
    try {
      const { error } = await supabaseAdmin
        .from('bookings')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId)
      
      if (error) throw error

      // Fire-and-forget notification to the customer
      try {
        const { data } = await supabaseAdmin
          .from('bookings')
          .select('customer_id, accommodation_id')
          .eq('id', bookingId)
          .single()
        if (data?.customer_id && data?.accommodation_id) {
          await sendBookingStatusUpdateNotification(
            bookingId,
            data.customer_id,
            data.accommodation_id,
            status
          )
        }
      } catch (notifyErr) {
        console.warn('Notification dispatch failed (non-fatal):', notifyErr)
      }
      
      // Refresh the list
      fetchBookings()
    } catch (error) {
      console.error(`Error ${status} booking:`, error)
      toast.error(`Failed to ${status} booking. Please try again.`)
    }
  }

  const handleSaveBooking = async (data: Partial<Booking>) => {
    try {
      console.log('Saving booking data:', data);
      
      if (editingBooking) {
        // Update existing booking
        const { error } = await supabaseAdmin
          .from('bookings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingBooking.id)
        
        if (error) {
          console.error('Error updating booking:', error);
          throw new Error(`Failed to update booking: ${error.message || 'Unknown error'}`);
        }
      } else {
        // Create new booking
        const { error } = await supabaseAdmin
          .from('bookings')
          .insert(data)
        
        if (error) {
          console.error('Error creating booking:', error);
          throw new Error(`Failed to create booking: ${error.message || 'Unknown error'}`);
        }
      }
      
      // Refresh the list
      fetchBookings()
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.accommodationTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as 'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled')
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="mt-21 min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin')}
                className="flex mr-8 items-center text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-2xl font-bold">Booking Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Header with Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">All Bookings</h2>
                <p className="text-gray-600">Manage and confirm all booking requests</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={filterStatus}
                  onChange={handleFilterStatusChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <button 
                  onClick={handleCreateBooking}
                  className="flex items-center justify-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <p>Loading bookings...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest Contact & Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner Contact & Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accommodation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates & Guests
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Email: {booking.guestEmail}</div>
                            <div>Phone: {booking.guestPhone}</div>
                            <div>Address: {booking.guestAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.ownerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Email: {booking.ownerEmail}</div>
                            <div>Phone: {booking.ownerPhone}</div>
                            <div>Address: {booking.ownerAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium">{booking.accommodationTitle}</div>
                            <div>
                              {booking.accommodationType}
                              {booking.roomName && ` - ${booking.roomName}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(booking.check_in_date).toLocaleDateString()} to {new Date(booking.check_out_date).toLocaleDateString()}</div>
                            <div>{booking.num_of_guests} guests</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rwf {booking.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditBooking(booking)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                    className="flex items-center text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirm
                                  </button>
                                  <button 
                                    onClick={() => handleBookingAction(booking.id, 'rejected')}
                                    className="flex items-center text-red-600 hover:text-red-900"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                  className="flex items-center text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </button>
                              )}
                              {(booking.status === 'rejected' || booking.status === 'cancelled') && (
                                <span className="text-gray-500">Closed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Booking Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? "Edit Booking" : "Create New Booking"}
        size="lg"
      >
        <BookingForm
          booking={editingBooking}
          onSubmit={handleSaveBooking}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </ProtectedRoute>
  )
}