import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
import AccommodationPopup from '../app/components/features/AccommodationPopup'

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
      room_count: 2,
      bathroom_count: 1,
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

describe('AccommodationPopup', () => {
  it('renders without crashing', async () => {
    const mockClose = jest.fn()
    renderWithClient(<AccommodationPopup onClose={mockClose} />)
    
    // Check if the title is rendered
    expect(screen.getByText('Available Accommodations')).toBeInTheDocument()
    
    // Check if loading state is shown initially
    expect(screen.getByText('Loading available accommodations...')).toBeInTheDocument()
    
    // Wait for the data to load
    const propertyTitle = await screen.findByText('Test Property')
    expect(propertyTitle).toBeInTheDocument()
  })
  
  it('calls onClose when close button is clicked', async () => {
    const mockClose = jest.fn()
    renderWithClient(<AccommodationPopup onClose={mockClose} />)
    
    // Wait for the component to load
    await screen.findByText('Test Property')
    
    // Click the close button
    const closeButton = screen.getByRole('button', { name: '' })
    closeButton.click()
    
    // Check if onClose was called
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})