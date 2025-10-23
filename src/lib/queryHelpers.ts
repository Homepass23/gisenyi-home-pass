import { supabase } from './supabaseClient'

// Define the accommodation type that matches our frontend needs
export interface QueryAccommodation {
  id: string
  title: string
  description: string
  location: string
  price_per_night: number
  image_urls: string[]
  rating: number
  type: 'entire' | 'room'
  free_cancel: boolean
  amenities: string[]
  max_guests?: number // Add max guests property
  room_count?: number // Number of bedrooms
  bathroom_count?: number // Number of bathrooms
  allow_independent_room_booking?: boolean // Whether the accommodation allows independent room booking
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    created_at: string
    user?: {
      name: string
    }
  }>
  created_at?: string // Add created_at property
}

// Update the SupabaseAccommodation interface to match the new schema
interface SupabaseAccommodation {
  id: string;
  title: string;
  description: string;
  type: 'house' | 'room';
  location: string;
  coordinates: string;
  price_per_night: number;
  num_of_guests: number;
  num_of_rooms: number;
  num_of_bathrooms: number;
  amenities: string[];
  cancellation_policy: string;
  allow_independent_room_booking: boolean;
  rating: number;
  host_id: string;
  created_at: string;
  updated_at: string;
}

// Import the getAccommodationGalleryImages function
import { getAccommodationGalleryImages, getReviewsByAccommodationId } from './supabaseHelpers';

// Function to fetch all accommodations with proper structure for frontend
export async function fetchAccommodations(): Promise<QueryAccommodation[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*');

  if (error) throw error;

  // Transform the data to match our frontend needs
  const accommodations = await Promise.all((data as SupabaseAccommodation[]).map(async (acc) => {
    // Fetch gallery images for this accommodation
    const galleryImages = await getAccommodationGalleryImages(acc.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: acc.id,
      title: acc.title,
      description: acc.description,
      location: acc.location,
      price_per_night: acc.price_per_night,
      image_urls: imageUrls,
      rating: acc.rating,
      type: acc.type === 'house' ? 'entire' : 'room',
      free_cancel: acc.cancellation_policy === 'free',
      amenities: acc.amenities || [],
      max_guests: acc.num_of_guests,
      room_count: acc.num_of_rooms,
      bathroom_count: acc.num_of_bathrooms,
      allow_independent_room_booking: acc.allow_independent_room_booking,
      created_at: acc.created_at
    } as QueryAccommodation;
  }));

  return accommodations;
}

// Function to fetch accommodations with pagination support
export async function fetchAccommodationsPaginated(
  page: number, 
  limit: number = 10,
  filters: {
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    roomType?: 'entire' | 'room'
    minRating?: number
    freeCancel?: boolean
    sortBy?: string
    maxGuests?: number
    checkInDate?: string
    checkOutDate?: string
  } = {}
): Promise<{ data: QueryAccommodation[], hasNextPage: boolean, totalCount: number }> {
  let query = supabase
    .from('accommodations')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price_per_night', filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_per_night', filters.maxPrice);
  }
  
  if (filters.roomType) {
    // Map 'entire' to 'house' and 'room' to 'room'
    const dbType = filters.roomType === 'entire' ? 'house' : 'room';
    query = query.eq('type', dbType);
  }
  
  if (filters.freeCancel !== undefined) {
    query = query.eq('cancellation_policy', filters.freeCancel ? 'free' : 'partial');
  }
  
  if (filters.minRating !== undefined) {
    query = query.gte('rating', filters.minRating);
  }
  
  if (filters.maxGuests !== undefined && filters.maxGuests > 0) {
    query = query.gte('num_of_guests', filters.maxGuests);
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'price_low':
      query = query.order('price_per_night', { ascending: true });
      break;
    case 'price_high':
      query = query.order('price_per_night', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform the data to match our frontend needs
  let accommodations = await Promise.all((data as SupabaseAccommodation[]).map(async (acc) => {
    // Fetch gallery images for this accommodation
    const galleryImages = await getAccommodationGalleryImages(acc.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: acc.id,
      title: acc.title,
      description: acc.description,
      location: acc.location,
      price_per_night: acc.price_per_night,
      image_urls: imageUrls,
      rating: acc.rating,
      type: acc.type === 'house' ? 'entire' : 'room',
      free_cancel: acc.cancellation_policy === 'free',
      amenities: acc.amenities || [],
      max_guests: acc.num_of_guests,
      room_count: acc.num_of_rooms,
      bathroom_count: acc.num_of_bathrooms,
      allow_independent_room_booking: acc.allow_independent_room_booking,
      created_at: acc.created_at
    } as QueryAccommodation;
  }));

  // Apply amenities filter (this needs to be done after fetching since it's stored as an array)
  if (filters.amenities && filters.amenities.length > 0) {
    accommodations = accommodations.filter(acc => {
      return filters.amenities!.every(amenity => acc.amenities?.includes(amenity));
    });
  }

  // Apply rating filter (this also needs to be done after fetching)
  if (filters.minRating !== undefined) {
    accommodations = accommodations.filter(acc => acc.rating >= filters.minRating!);
  }

  // Apply max guests filter
  if (filters.maxGuests !== undefined && filters.maxGuests > 0) {
    accommodations = accommodations.filter(acc => {
      return acc.max_guests !== undefined && acc.max_guests >= filters.maxGuests!;
    });
  }

  // Apply date availability filter
  if (filters.checkInDate && filters.checkOutDate) {
    // For now, we'll assume all accommodations are available
    // In a real implementation, we would check against bookings table
    // This is a placeholder for the availability logic
  }

  // Apply rating sorting if requested
  if (filters.sortBy === 'rating') {
    accommodations = accommodations.sort((a, b) => b.rating - a.rating);
  }

  const hasNextPage = count ? (from + limit) < count : false;

  return {
    data: accommodations,
    hasNextPage,
    totalCount: count || 0
  };
}

// Function to fetch top-rated accommodations
export async function fetchTopRatedAccommodations(limit: number = 4): Promise<QueryAccommodation[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Transform the data to match our frontend needs
  const accommodations = await Promise.all((data as SupabaseAccommodation[]).map(async (acc) => {
    // Fetch gallery images for this accommodation
    const galleryImages = await getAccommodationGalleryImages(acc.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: acc.id,
      title: acc.title,
      description: acc.description,
      location: acc.location,
      price_per_night: acc.price_per_night,
      image_urls: imageUrls,
      rating: acc.rating,
      type: acc.type === 'house' ? 'entire' : 'room',
      free_cancel: acc.cancellation_policy === 'free',
      amenities: acc.amenities || [],
      max_guests: acc.num_of_guests,
      room_count: acc.num_of_rooms,
      bathroom_count: acc.num_of_bathrooms,
      allow_independent_room_booking: acc.allow_independent_room_booking,
      created_at: acc.created_at
    } as QueryAccommodation;
  }));

  return accommodations;
}

// Function to fetch similar accommodations based on location
export async function fetchSimilarAccommodations(location: string, excludeId: string, limit: number = 3): Promise<QueryAccommodation[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .ilike('location', `%${location}%`) // Match accommodations in the same location
    .neq('id', excludeId) // Exclude the current accommodation
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Transform the data to match our frontend needs
  const accommodations = await Promise.all((data as SupabaseAccommodation[]).map(async (acc) => {
    // Fetch gallery images for this accommodation
    const galleryImages = await getAccommodationGalleryImages(acc.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: acc.id,
      title: acc.title,
      description: acc.description,
      location: acc.location,
      price_per_night: acc.price_per_night,
      image_urls: imageUrls,
      rating: acc.rating,
      type: acc.type === 'house' ? 'entire' : 'room',
      free_cancel: acc.cancellation_policy === 'free',
      amenities: acc.amenities || [],
      max_guests: acc.num_of_guests,
      room_count: acc.num_of_rooms,
      bathroom_count: acc.num_of_bathrooms,
      allow_independent_room_booking: acc.allow_independent_room_booking,
      created_at: acc.created_at
    } as QueryAccommodation;
  }));

  return accommodations;
}

// Function to fetch the total count of all accommodations (without filters)
export async function fetchTotalAccommodationsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('accommodations')
    .select('*', { count: 'exact' });

  if (error) throw error;

  return count || 0;
}

// Function to fetch a single accommodation by ID
export async function fetchAccommodationById(id: string): Promise<QueryAccommodation> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id);

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('Accommodation not found');
  }

  // Transform the data to match our frontend needs
  const acc = data[0] as SupabaseAccommodation;
  
  // Fetch gallery images for this accommodation
  const galleryImages = await getAccommodationGalleryImages(acc.id);
  const imageUrls = galleryImages.map(img => img.image_url);
  
  // Fetch reviews for this accommodation
  const reviews = await getReviewsByAccommodationId(acc.id);
  
  // Transform reviews to match frontend expectations
  const transformedReviews = reviews?.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    user: review.user ? { name: review.user.full_name } : 
          (review.reviewer_name ? { name: review.reviewer_name } : undefined)
  })) || [];
  
  return {
    id: acc.id,
    title: acc.title,
    description: acc.description,
    location: acc.location,
    price_per_night: acc.price_per_night,
    image_urls: imageUrls,
    rating: acc.rating,
    type: acc.type === 'house' ? 'entire' : 'room',
    free_cancel: acc.cancellation_policy === 'free',
    amenities: acc.amenities || [],
    max_guests: acc.num_of_guests,
    room_count: acc.num_of_rooms,
    bathroom_count: acc.num_of_bathrooms,
    allow_independent_room_booking: acc.allow_independent_room_booking,
    created_at: acc.created_at,
    reviews: transformedReviews
  } as QueryAccommodation
}

// Function to fetch bookings for a specific accommodation
export async function fetchAccommodationBookings(accommodationId: string): Promise<Array<{start_date: string, end_date: string}>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('check_in_date, check_out_date')  // Changed from start_date, end_date to check_in_date, check_out_date
    .eq('accommodation_id', accommodationId)
    .eq('status', 'confirmed')

  if (error) throw error

  // Map check_in_date and check_out_date to start_date and end_date
  return (data || []).map(booking => ({
    start_date: booking.check_in_date,
    end_date: booking.check_out_date
  }));
}

// Function to fetch bookings for a specific room
export async function fetchRoomBookings(roomId: string): Promise<Array<{start_date: string, end_date: string}>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('check_in_date, check_out_date')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')

  if (error) throw error

  // Map check_in_date and check_out_date to start_date and end_date
  return (data || []).map(booking => ({
    start_date: booking.check_in_date,
    end_date: booking.check_out_date
  }));
}

// Define the AccommodationRoom interface
interface AccommodationRoom {
  id: string;
  accommodation_id: string;
  room_name: string;
  description: string;
  price_per_night: number;
  num_of_guests: number;
  num_of_beds: number;
  private_bathroom: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

// Function to fetch a single accommodation room by ID
export async function fetchAccommodationRoomById(roomId: string): Promise<AccommodationRoom> {
  try {
    // Fetch the room directly from the accommodation_rooms table
    const { data, error } = await supabase
      .from('accommodation_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Room not found');

    // Fetch gallery images for this room
    const galleryImages = await getAccommodationGalleryImages(data.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: data.id,
      accommodation_id: data.accommodation_id,
      room_name: data.room_name,
      description: data.description,
      price_per_night: data.price_per_night,
      num_of_guests: data.num_of_guests,
      num_of_beds: data.num_of_beds,
      private_bathroom: data.private_bathroom,
      image_urls: imageUrls,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as AccommodationRoom;
  } catch (error) {
    console.error('Error fetching accommodation room:', error);
    throw error;
  }
}

// Function to fetch rooms for a specific accommodation
export async function fetchAccommodationRooms(accommodationId: string): Promise<AccommodationRoom[]> {
  // Import the function from supabaseHelpers
  const { getAccommodationRooms } = await import('./supabaseHelpers');
  
  try {
    const rooms = await getAccommodationRooms(accommodationId);
    
    // Transform the data to match our frontend needs
    return await Promise.all(rooms.map(async (room) => {
      // Fetch gallery images for this room
      const galleryImages = await getAccommodationGalleryImages(room.id);
      const imageUrls = galleryImages.map(img => img.image_url);
      
      return {
        id: room.id,
        accommodation_id: room.accommodation_id,
        room_name: room.room_name,
        description: room.description,
        price_per_night: room.price_per_night,
        num_of_guests: room.num_of_guests,
        num_of_beds: room.num_of_beds,
        private_bathroom: room.private_bathroom,
        image_urls: imageUrls,
        created_at: room.created_at,
        updated_at: room.updated_at
      } as AccommodationRoom;
    }));
  } catch (error) {
    console.error('Error fetching accommodation rooms:', error);
    throw error;
  }
}

// Function to fetch similar accommodations based on price range and type (without location constraint)
export async function fetchSimilarAccommodationsByPriceAndType(
  location: string, 
  excludeId: string, 
  price: number, 
  type: 'entire' | 'room', 
  limit: number = 3
): Promise<QueryAccommodation[]> {
  // Calculate price range (±20% of the original price)
  const minPrice = price * 0.8;
  const maxPrice = price * 1.2;
  
  // Map frontend type to database type
  const dbType = type === 'entire' ? 'house' : 'room';
  
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .neq('id', excludeId) // Exclude the current accommodation
    .eq('type', dbType) // Match the same type
    .gte('price_per_night', minPrice) // Within price range
    .lte('price_per_night', maxPrice) // Within price range
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Transform the data to match our frontend needs
  const accommodations = await Promise.all((data as SupabaseAccommodation[]).map(async (acc) => {
    // Fetch gallery images for this accommodation
    const galleryImages = await getAccommodationGalleryImages(acc.id);
    const imageUrls = galleryImages.map(img => img.image_url);
    
    return {
      id: acc.id,
      title: acc.title,
      description: acc.description,
      location: acc.location,
      price_per_night: acc.price_per_night,
      image_urls: imageUrls,
      rating: acc.rating,
      type: acc.type === 'house' ? 'entire' : 'room',
      free_cancel: acc.cancellation_policy === 'free',
      amenities: acc.amenities || [],
      max_guests: acc.num_of_guests,
      room_count: acc.num_of_rooms,
      bathroom_count: acc.num_of_bathrooms,
      allow_independent_room_booking: acc.allow_independent_room_booking,
      created_at: acc.created_at
    } as QueryAccommodation;
  }));

  return accommodations;
}
