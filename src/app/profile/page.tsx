'use client'

import React from 'react'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Link from 'next/link'
import BookingStepper from '../components/features/BookingStepper'

export default function UserProfile() {
  const { user, signOut } = useAuth()

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name}</span>
              <button 
                onClick={signOut}
                className="bg-white text-sky-600 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <BookingStepper currentStep={4} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Bookings</h2>
                  <Link href="/accommodations" className="text-sky-600 hover:underline text-sm">
                    Book New Accommodation
                  </Link>
                </div>
                
                <div className="space-y-4">
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <div className="space-y-4">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
