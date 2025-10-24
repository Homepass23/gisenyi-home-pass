'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserRole } from '../../lib/supabaseHelpers'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  
  // Customer fields
  const [phoneNumber, setPhoneNumber] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  
  // Host-specific fields
  const [nationalIdOrPassport, setNationalIdOrPassport] = useState('')
  const [tinNumber, setTinNumber] = useState('')
  
  const { signUp, signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if user came from "Register" link
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'register') {
      setIsSignUp(true)
    }
  }, [searchParams])

  // Handle redirection when user is authenticated
  // Only redirect if user is signing in, not after signup
  useEffect(() => {
    if (!authLoading && user && !redirecting && !isSignUp) {
      setRedirecting(true)
      const redirectPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'host' ? '/owner' : 
                         '/customer'
      router.push(redirectPath)
    }
  }, [user, authLoading, router, redirecting, isSignUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const userData = {
          email,
          password,
          role,
          full_name: name,
          phone_number: phoneNumber,
          street_address: streetAddress,
          city,
          date_of_birth: dateOfBirth,
          national_id_or_passport: nationalIdOrPassport,
          tin_number: tinNumber
        };

        const { error } = await signUp(userData)
        if (error) {
          setError(error || 'Failed to sign up')
          setLoading(false)
        } else {
          // Successfully signed up, redirect to login page
          setIsSignUp(false)
          setError('Signup successful! Please sign in with your credentials.')
          // Clear form fields
          setEmail('')
          setPassword('')
          setName('')
          setPhoneNumber('')
          setStreetAddress('')
          setCity('')
          setDateOfBirth('')
          setNationalIdOrPassport('')
          setTinNumber('')
          setLoading(false)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error || 'Failed to sign in')
          setLoading(false)
        }
        // Redirect will be handled by the useEffect above when user state updates
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Show loading state while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-12 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div> 
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="sr-only">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                  >
                    <option value="customer">Customer (Book Accommodations)</option>
                    <option value="host">Accommodation Owner</option>
                  </select>
                </div>
                
                {/* Customer and Host Common Fields */}
                <div>
                  <label htmlFor="phone-number" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    id="phone-number"
                    name="phone-number"
                    type="tel"
                    required={isSignUp}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label htmlFor="street-address" className="sr-only">
                    Street Address
                  </label>
                  <input
                    id="street-address"
                    name="street-address"
                    type="text"
                    required={isSignUp}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                    placeholder="Street Address"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="sr-only">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required={isSignUp}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label htmlFor="date-of-birth" className="sr-only">
                    Date of Birth
                  </label>
                  <input
                    id="date-of-birth"
                    name="date-of-birth"
                    type="date"
                    required={isSignUp}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                    placeholder="Date of Birth"
                  />
                </div>
                
                {/* Host-specific Fields */}
                {role === 'host' && (
                  <>
                    <div>
                      <label htmlFor="national-id" className="sr-only">
                        National ID or Passport
                      </label>
                      <input
                        id="national-id"
                        name="national-id"
                        type="text"
                        required={role === 'host'}
                        value={nationalIdOrPassport}
                        onChange={(e) => setNationalIdOrPassport(e.target.value)}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                        placeholder="National ID or Passport"
                      />
                    </div>
                    <div>
                      <label htmlFor="tin-number" className="sr-only">
                        TIN Number
                      </label>
                      <input
                        id="tin-number"
                        name="tin-number"
                        type="text"
                        required={role === 'host'}
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                        placeholder="TIN Number"
                      />
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || authLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {loading || authLoading ? (
                'Loading...'
              ) : isSignUp ? (
                'Sign up'
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-sky-600 hover:text-sky-500"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}