import { signUpUser, signInUser, signOutUser } from '../lib/authService'

// Mock the Supabase client
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn()
  }
}

const mockSupabaseAdmin = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}

jest.mock('../lib/supabaseClient', () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabaseAdmin
}))

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUpUser', () => {
    it('should successfully sign up a customer', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' }
      }
      
      // Mock Supabase auth response
      mockSupabase.auth.signUp.mockResolvedValue({ data: mockAuthData, error: null })

      // Mock Supabase admin insert response
      mockSupabaseAdmin.insert.mockResolvedValue({ error: null })

      const result = await signUpUser({
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
        full_name: 'Test User',
        phone_number: '1234567890',
        street_address: '123 Test St',
        city: 'Test City',
        date_of_birth: '1990-01-01'
      })

      expect(result.success).toBe(true)
      expect(result.data?.userId).toBe('user-123')
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should successfully sign up a host', async () => {
      const mockAuthData = {
        user: { id: 'host-123', email: 'host@example.com' }
      }
      
      // Mock Supabase auth response
      mockSupabase.auth.signUp.mockResolvedValue({ data: mockAuthData, error: null })

      // Mock Supabase admin insert response
      mockSupabaseAdmin.insert.mockResolvedValue({ error: null })

      const result = await signUpUser({
        email: 'host@example.com',
        password: 'password123',
        role: 'owner',
        full_name: 'Test Host',
        phone_number: '1234567890',
        street_address: '123 Test St',
        city: 'Test City',
        date_of_birth: '1990-01-01',
        national_id_or_passport: 'ID123456',
        tin_number: 'TIN123456'
      })

      expect(result.success).toBe(true)
      expect(result.data?.userId).toBe('host-123')
    })

    it('should handle signup errors', async () => {
      // Mock Supabase auth error
      mockSupabase.auth.signUp.mockResolvedValue({ 
        data: null, 
        error: { message: 'Email already exists' } 
      })

      const result = await signUpUser({
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
        full_name: 'Test User',
        phone_number: '1234567890',
        street_address: '123 Test St',
        city: 'Test City',
        date_of_birth: '1990-01-01'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })
  })

  describe('signInUser', () => {
    it('should successfully sign in a user', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' }
      }
      
      // Mock Supabase auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: mockAuthData, error: null })

      // Mock Supabase select response
      mockSupabaseAdmin.select.mockReturnValue(mockSupabaseAdmin)
      mockSupabaseAdmin.eq.mockReturnValue(mockSupabaseAdmin)
      mockSupabaseAdmin.single.mockResolvedValue({ data: mockAuthData.user, error: null })

      const result = await signInUser('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.data?.user.email).toBe('test@example.com')
    })

    it('should handle signin errors', async () => {
      // Mock Supabase auth error
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid credentials' } 
      })

      const result = await signInUser('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })
  })

  describe('signOutUser', () => {
    it('should successfully sign out a user', async () => {
      // Mock Supabase signOut response
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await signOutUser()

      expect(result.success).toBe(true)
    })

    it('should handle signout errors', async () => {
      // Mock Supabase signOut error
      mockSupabase.auth.signOut.mockResolvedValue({ 
        error: { message: 'Sign out failed' } 
      })

      const result = await signOutUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sign out failed')
    })
  })
})