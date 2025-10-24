import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
import PropertyCard from '../app/components/features/PropertyCard'

// Mock the fetchTopRatedAccommodations function
jest.mock('../lib/queryHelpers', () => ({
  fetchTopRatedAccommodations: jest.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test Property',
      description: 'A beautiful test property',
      location: 'Test Location',
      price_per_night: 100,
      image_urls: ['/test-image.jpg'],
      rating: 4.5,
      type: 'room',
      free_cancel: true,
      amenities: ['wifi', 'tv'],
    },
  ]),
}))

const queryClient = new QueryClient()

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('PropertyCard', () => {
  it('renders without crashing', async () => {
    renderWithClient(<PropertyCard />)
    
    // Check if loading state is shown initially
    expect(screen.getByText('Loading properties...')).toBeInTheDocument()
    
    // Wait for the data to load
    const propertyTitle = await screen.findByText('Test Property')
    expect(propertyTitle).toBeInTheDocument()
  })
})