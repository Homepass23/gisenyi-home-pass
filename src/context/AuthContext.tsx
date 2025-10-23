'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User as AppUser, UserRole } from '../lib/supabaseHelpers'
import { AuthContextType } from '../lib/authTypes'
import { signInUser, signOutUser, refreshUser, updateUser as updateUserService, updatePassword as updatePasswordService } from '../lib/authService'



// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check active session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Fetch user details from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
        
        if (!error && userData && userData.length > 0) {
          setUser({
            id: userData[0].id,
            email: userData[0].email,
            role: userData[0].role,
            full_name: userData[0].full_name,
            phone_number: userData[0].phone_number,
            street_address: userData[0].street_address,
            city: userData[0].city,
            profile_image_url: userData[0].profile_image_url,
            date_of_birth: userData[0].date_of_birth,
            verified: userData[0].verified,
            national_id_or_passport: userData[0].national_id_or_passport,
            tin_number: userData[0].tin_number,
            created_at: userData[0].created_at,
            updated_at: userData[0].updated_at
          })
        }
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Fetch user details from users table
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .then(({ data: userData, error }) => {
            if (!error && userData && userData.length > 0) {
              setUser({
                id: userData[0].id,
                email: userData[0].email,
                role: userData[0].role,
                full_name: userData[0].full_name,
                phone_number: userData[0].phone_number,
                street_address: userData[0].street_address,
                city: userData[0].city,
                profile_image_url: userData[0].profile_image_url,
                date_of_birth: userData[0].date_of_birth,
                verified: userData[0].verified,
                national_id_or_passport: userData[0].national_id_or_passport,
                tin_number: userData[0].tin_number,
                created_at: userData[0].created_at,
                updated_at: userData[0].updated_at
              })
            }
          })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign up function
  const signUp = async (userData: {
    email: string;
    password: string;
    role: UserRole;
    full_name?: string;
    phone_number?: string;
    street_address?: string;
    city?: string;
    date_of_birth?: string;
    national_id_or_passport?: string;
    tin_number?: string;
  }) => {
    // Validate required fields based on role
    if (!userData.email || !userData.password || !userData.role) {
      return Promise.resolve({ success: false, error: 'Email, password, and role are required' });
    }

    // Validate host-specific fields
    if (userData.role === 'host') {
      if (!userData.full_name || !userData.phone_number || !userData.street_address || !userData.city || !userData.date_of_birth || !userData.national_id_or_passport || !userData.tin_number) {
        return Promise.resolve({ success: false, error: 'All fields are required for hosts' });
      }
    }

    // Validate customer-specific fields
    if (userData.role === 'customer') {
      if (!userData.full_name || !userData.phone_number || !userData.street_address || !userData.city || !userData.date_of_birth) {
        return Promise.resolve({ success: false, error: 'All fields are required for customers' });
      }
    }

    // Call server API to perform privileged signup steps
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const result = await response.json()
    return result
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    // Prefer client-side auth for proper session handling
    const result = await signInUser(email, password)
    if (result.success && result.data?.user) {
      setUser(result.data.user)
    }
    return result
  }

  // Sign out function
  const signOut = async () => {
    const result = await signOutUser();
    
    if (result.success) {
      setUser(null);
    }
    
    return result;
  }

  // Update user function
  const updateUser = async (id: string, userData: Partial<AppUser>) => {
    // Update the user in the database
    const result = await updateUserService(id, userData);
    
    if (result.success) {
      // Refresh the user data to get the latest state
      const updatedUser = await refreshUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  }

  // Update password function
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    return await updatePasswordService(currentPassword, newPassword);
  }

  // Role checking helpers
  const isAdmin = Boolean(user?.role === 'admin')
  const isHost = Boolean(user?.role === 'host')
  const isCustomer = Boolean(user?.role === 'customer')

  const value: AuthContextType = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    isAdmin,
    isHost,
    isCustomer,
    updateUser,
    updatePassword,
    refreshUser: async () => {
      const result = await refreshUser();
      if (result) {
        setUser(result);
      }
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}