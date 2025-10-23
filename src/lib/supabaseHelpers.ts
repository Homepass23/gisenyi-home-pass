import { supabase, supabaseAdmin } from './supabaseClient'

// Define types for our data structures
export type UserRole = 'admin' | 'host' | 'customer';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';
export type AccommodationType = 'house' | 'room';
export type CancellationPolicy = 'free' | 'partial' | 'none';
export type InquiryStatus = 'new' | 'responded' | 'closed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
  profile_image_url: string | null;
  date_of_birth: string | null;
  verified: boolean;
  national_id_or_passport: string | null;
  tin_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  title: string;
  description: string | null;
  type: AccommodationType;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  num_of_guests: number | null;
  num_of_rooms: number | null;
  num_of_bathrooms: number | null;
  amenities: string[] | null;
  cancellation_policy: CancellationPolicy;
  allow_independent_room_booking: boolean;
  rating: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// Add a new interface for accommodation rooms
export interface AccommodationRoom {
  id: string;
  accommodation_id: string;
  room_name: string;
  description: string | null;
  price_per_night: number;
  num_of_guests: number | null;
  num_of_beds: number | null;
  private_bathroom: boolean | null;
  image_gallery: string[] | null;
  created_at: string;
  updated_at: string;
}

// Add a new interface for accommodation gallery images
export interface AccommodationGalleryImage {
  id: string;
  accommodation_id: string;
  image_url: string;
  created_at: string;
}

export interface Booking {
  id: string;
  accommodation_id: string;
  room_id: string | null;
  customer_id: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  street_address: string | null;
  city: string;
  check_in_date: string;
  check_out_date: string;
  num_of_guests: number;
  status: BookingStatus;
  cancellation_requested: boolean | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  accommodation_id: string;
  customer_id: string;
  booking_id: string | null;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  reviewer_image_url: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string | null;
  subject: string | null;
  body: string | null;
  sent_at: string;
  event: string | null;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

// User functions
export async function createUser(userData: Partial<User>) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(userData)
    .select()
  
  if (error) throw error
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
  
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
  
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

export async function updateUser(id: string, userData: Partial<User>) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

// Accommodation functions
export async function createAccommodation(accommodationData: Partial<Accommodation>) {
  const { data, error } = await supabaseAdmin
    .from('accommodations')
    .insert(accommodationData)
    .select()
  
  if (error) throw error
  return data
}

export async function getAccommodations(filters: {
  minPrice?: number;
  maxPrice?: number;
  type?: AccommodationType;
  minRating?: number;
  freeCancellation?: boolean;
  guests?: number;
  rooms?: number;
  amenities?: string[];
} = {}) {
  let query = supabase
    .from('accommodations')
    .select('*')
  
  // Apply filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price_per_night', filters.minPrice)
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_per_night', filters.maxPrice)
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters.minRating !== undefined) {
    query = query.gte('rating', filters.minRating)
  }
  
  if (filters.freeCancellation) {
    query = query.eq('cancellation_policy', 'free')
  }
  
  if (filters.guests !== undefined) {
    query = query.gte('num_of_guests', filters.guests)
  }
  
  if (filters.rooms !== undefined) {
    query = query.gte('num_of_rooms', filters.rooms)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getAccommodationById(id: string) {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
  
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}

export async function updateAccommodation(id: string, accommodationData: Partial<Accommodation>) {
  const { data, error } = await supabaseAdmin
    .from('accommodations')
    .update(accommodationData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

export async function deleteAccommodation(id: string) {
  const { error } = await supabaseAdmin
    .from('accommodations')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Add a function to fetch gallery images for an accommodation
export async function getAccommodationGalleryImages(accommodationId: string): Promise<AccommodationGalleryImage[]> {
  const { data, error } = await supabase
    .from('accommodation_gallery')
    .select('*')
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Add a function to fetch accommodation rooms by accommodation ID
export async function getAccommodationRooms(accommodationId: string): Promise<AccommodationRoom[]> {
  const { data, error } = await supabase
    .from('accommodation_rooms')
    .select('*')
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Booking functions
export async function createBooking(bookingData: Partial<Booking>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
  
  if (error) throw error
  return data
}

export async function getBookingsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getBookingsByAccommodationId(accommodationId: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'rejected' | 'cancelled') {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
  
  if (error) throw error
  return data
}

// Check if accommodation is available for given dates
export async function isAccommodationAvailable(
  accommodationId: string, 
  checkIn: string, 
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('accommodation_id', accommodationId)
    .in('status', ['pending', 'confirmed'])
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn)
  
  if (error) throw error
  return data.length === 0
}

// Check if room is available for given dates
export async function isRoomAvailable(
  roomId: string, 
  checkIn: string, 
  checkOut: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('room_id', roomId)
    .in('status', ['pending', 'confirmed'])
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn)
  
  if (error) throw error
  return data.length === 0
}

// Review functions
export async function createReview(reviewData: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
  
  if (error) throw error
  return data
}

export async function getReviewsByAccommodationId(accommodationId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(full_name, profile_image_url)
    `)
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Calculate rating for an accommodation
export async function calculateAccommodationRating(accommodationId: string): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('accommodation_id', accommodationId)
  
  if (error) throw error
  
  if (data.length === 0) return 0
  
  const total = data.reduce((sum, review) => sum + review.rating, 0)
  return parseFloat((total / data.length).toFixed(1))
}

export async function updateAccommodationRating(accommodationId: string): Promise<void> {
  const rating = await calculateAccommodationRating(accommodationId)
  await supabaseAdmin
    .from('accommodations')
    .update({ rating, updated_at: new Date().toISOString() })
    .eq('id', accommodationId)
}

// Email log functions
export async function createEmailLog(emailData: Partial<EmailLog>) {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .insert(emailData)
    .select()
  
  if (error) throw error
  return data
}

// Customer inquiry functions
export async function createCustomerInquiry(inquiryData: Partial<CustomerInquiry>) {
  const { data, error } = await supabase
    .from('customer_inquiries')
    .insert(inquiryData)
    .select()
  
  if (error) throw error
  return data
}

export async function getCustomerInquiries() {
  const { data, error } = await supabaseAdmin
    .from('customer_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateCustomerInquiry(id: string, inquiryData: Partial<CustomerInquiry>) {
  const { data, error } = await supabaseAdmin
    .from('customer_inquiries')
    .update(inquiryData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

// Storage functions for images
export async function uploadImage(file: File, bucket: string = 'accommodations') {
  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(fileName, file)
  
  if (error) throw error
  return data
}

export async function getImageUrl(path: string, bucket: string = 'accommodations') {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Room management functions
export async function createAccommodationRoom(roomData: Partial<AccommodationRoom>) {
  const { data, error } = await supabaseAdmin
    .from('accommodation_rooms')
    .insert(roomData)
    .select()
  
  if (error) throw error
  return data
}

export async function updateAccommodationRoom(id: string, roomData: Partial<AccommodationRoom>) {
  const { data, error } = await supabaseAdmin
    .from('accommodation_rooms')
    .update(roomData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

export async function deleteAccommodationRoom(id: string) {
  const { error } = await supabaseAdmin
    .from('accommodation_rooms')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Gallery management functions
export async function addAccommodationGalleryImage(accommodationId: string, imageUrl: string) {
  const { data, error } = await supabaseAdmin
    .from('accommodation_gallery')
    .insert({
      accommodation_id: accommodationId,
      image_url: imageUrl
    })
    .select()
  
  if (error) throw error
  return data
}

export async function deleteAccommodationGalleryImage(id: string) {
  const { error } = await supabaseAdmin
    .from('accommodation_gallery')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Ensure storage bucket exists
export async function ensureStorageBucket(bucketName: string = 'accommodations') {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .getBucket(bucketName)
    
    if (error && error.message.includes('not found')) {
      // Create bucket if it doesn't exist
      const { data: createData, error: createError } = await supabaseAdmin
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 104857600, // 100MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
      
      if (createError) throw createError
      return createData
    }
    
    return data
  } catch (error) {
    console.error('Error ensuring storage bucket:', error)
    throw error
  }
}