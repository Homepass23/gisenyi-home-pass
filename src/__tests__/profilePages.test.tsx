import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '../context/AuthContext'
import EditProfilePage from '../app/profile/edit/page'
import ChangePasswordPage from '../app/profile/change-password/page'

// Mock the auth context
jest.mock('../context/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Profile Pages', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'customer' as const,
    full_name: 'John Doe',
    phone_number: '+1234567890',
    street_address: '123 Main St',
    city: 'Test City',
    date_of_birth: '1990-01-01',
    verified: true,
    profile_image_url: null,
    national_id_or_passport: null,
    tin_number: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  const mockUpdateUser = jest.fn()
  const mockUpdatePassword = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
      updatePassword: mockUpdatePassword,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      isAdmin: false,
      isHost: false,
      isCustomer: true,
      refreshUser: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('EditProfilePage', () => {
    it('renders edit profile form with user data', () => {
      render(<EditProfilePage />)
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test City')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(<EditProfilePage />)
      
      const submitButton = screen.getByText('Update Profile')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument()
      })
    })

    it('calls updateUser when form is submitted with valid data', async () => {
      mockUpdateUser.mockResolvedValue(undefined)
      
      render(<EditProfilePage />)
      
      const submitButton = screen.getByText('Update Profile')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('1', expect.objectContaining({
          full_name: 'John Doe',
          phone_number: '+1234567890',
          street_address: '123 Main St',
          city: 'Test City',
          date_of_birth: '1990-01-01'
        }))
      })
    })
  })

  describe('ChangePasswordPage', () => {
    it('renders change password form', () => {
      render(<ChangePasswordPage />)
      
      expect(screen.getByText('Change Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your current password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument()
    })

    it('validates password requirements', async () => {
      render(<ChangePasswordPage />)
      
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password')
      fireEvent.change(newPasswordInput, { target: { value: 'weak' } })
      
      const submitButton = screen.getByText('Update Password')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('New password must be at least 8 characters long')).toBeInTheDocument()
      })
    })

    it('validates password confirmation', async () => {
      render(<ChangePasswordPage />)
      
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password')
      
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } })
      
      const submitButton = screen.getByText('Update Password')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('calls updatePassword when form is submitted with valid data', async () => {
      mockUpdatePassword.mockResolvedValue({ success: true })
      
      render(<ChangePasswordPage />)
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password')
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password')
      
      fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPassword123' } })
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } })
      
      const submitButton = screen.getByText('Update Password')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith('CurrentPassword123', 'NewPassword123')
      })
    })
  })
})

