'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function VerifyPageContent() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('No verification token provided')
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })
        
        const data = await response.json()
        
        if (data.success) {
          setMessage('Email verified successfully! You can now log in to your account.')
          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setError(data.error || 'Failed to verify email')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError('An error occurred during verification')
      } finally {
        setLoading(false)
      }
    }
    
    verifyToken()
  }, [searchParams, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium">{error}</div>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-500 text-lg font-medium">{message}</div>
              <p className="mt-2 text-gray-600">Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}