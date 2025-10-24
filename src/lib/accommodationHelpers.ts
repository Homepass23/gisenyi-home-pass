import { 
  createAccommodation, 
  updateAccommodation, 
  deleteAccommodation, 
  getAccommodations, 
  getAccommodationById,
  calculateAccommodationRating
} from './supabaseHelpers'
import { Accommodation } from './supabaseHelpers'

/**
 * Create a new accommodation with validation
 */
export async function createNewAccommodation(accommodationData: Partial<Accommodation>) {
  // Validate required fields
  if (!accommodationData.title) {
    throw new Error('Title is required')
  }
  
  if (!accommodationData.type) {
    throw new Error('Type is required')
  }
  
  if (!accommodationData.price_per_night) {
    throw new Error('Price per night is required')
  }
  
  if (!accommodationData.owner_id) {
    throw new Error('Owner ID is required')
  }
  
  // Set default values
  const newAccommodation: Partial<Accommodation> = {
    ...accommodationData,
    rating: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Create the accommodation
  const accommodation = await createAccommodation(newAccommodation)
  
  return accommodation
}

/**
 * Update an existing accommodation
 */
export async function updateExistingAccommodation(id: string, accommodationData: Partial<Accommodation>) {
  // Update the accommodation
  const accommodation = await updateAccommodation(id, {
    ...accommodationData,
    updated_at: new Date().toISOString()
  })
  
  return accommodation
}

/**
 * Delete an accommodation
 */
export async function removeAccommodation(id: string) {
  // Delete the accommodation
  await deleteAccommodation(id)
}

/**
 * Get accommodations with filtering and sorting options
 */
export async function searchAccommodations(filters: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: 'house' | 'room';
  minRating?: number;
  freeCancellation?: boolean;
  guests?: number;
  rooms?: number;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
} = {}) {
  // Get accommodations with filters
  const accommodations = await getAccommodations(filters)
  
  // Apply sorting if specified
  if (filters.sortBy) {
    accommodations.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'price':
          comparison = a.price_per_night - b.price_per_night
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }
  
  return accommodations
}

/**
 * Get accommodation details with calculated rating
 */
export async function getAccommodationDetails(id: string) {
  const accommodation = await getAccommodationById(id)
  
  if (!accommodation) {
    throw new Error('Accommodation not found')
  }
  
  // Calculate current rating
  const rating = await calculateAccommodationRating(id)
  
  return {
    ...accommodation,
    rating
  }
}

/**
 * Check if accommodation type is valid
 */
export function isValidAccommodationType(type: string): type is 'house' | 'room' {
  return type === 'house' || type === 'room'
}

/**
 * Check if cancellation policy is valid
 */
export function isValidCancellationPolicy(policy: string): boolean {
  return ['free', 'partial', 'none'].includes(policy)
}