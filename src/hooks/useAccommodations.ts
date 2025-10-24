import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchAccommodationsPaginated, QueryAccommodation, fetchTotalAccommodationsCount } from '../lib/queryHelpers'

interface UseAccommodationsParams {
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  roomType?: 'house' | 'room'
  minRating?: number
  freeCancel?: boolean
  sortBy?: string
  maxGuests?: number
  checkInDate?: string
  checkOutDate?: string
}

// Extended type to include pagination info
interface PaginatedAccommodations extends Array<QueryAccommodation> {
  _hasNextPage?: boolean
  _totalCount?: number
}

export const useAccommodations = (filters: UseAccommodationsParams = {}) => {
  // Map the roomType to match what the backend expects
  const backendFilters: {
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
  } = {
    ...filters,
    roomType: filters.roomType ? (filters.roomType === 'house' ? 'entire' : 'room') : undefined
  };

  return useInfiniteQuery<QueryAccommodation[]>({
    queryKey: ['accommodations', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchAccommodationsPaginated(pageParam as number, 10, backendFilters)
      
      // Create a new array with the pagination info attached
      const dataWithPagination: PaginatedAccommodations = [...result.data]
      dataWithPagination._hasNextPage = result.hasNextPage
      dataWithPagination._totalCount = result.totalCount
      return dataWithPagination
    },
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more pages based on backend response
      const paginatedPage = lastPage as PaginatedAccommodations
      const hasNextPage = paginatedPage._hasNextPage
      return hasNextPage ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 60 * 1000, // 1 minute
  })
}

// New hook to fetch total accommodations count before filtering
export const useTotalAccommodationsCount = () => {
  return useQuery<number>({
    queryKey: ['totalAccommodationsCount'],
    queryFn: fetchTotalAccommodationsCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}