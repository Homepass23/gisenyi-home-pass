'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ImageUpload from '../../components/shared/ImageUpload'
import Image from 'next/image'

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    date_of_birth: '',
    national_id_or_passport: '',
    tin_number: '',
    profile_image_url: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        street_address: user.street_address || '',
        city: user.city || '',
        date_of_birth: user.date_of_birth || '',
        national_id_or_passport: user.national_id_or_passport || '',
        tin_number: user.tin_number || '',
        profile_image_url: user.profile_image_url || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (images: string[]) => {
    // For profile picture, we only allow one image
    const imageUrl = images.length > 0 ? images[0] : ''
    setFormData(prev => ({ ...prev, profile_image_url: imageUrl }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Required fields for all users
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!/^[0-9+\-\s()]*$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number'
    }

    if (!formData.street_address.trim()) {
      newErrors.street_address = 'Street address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    }

    // Host-specific fields
    if (user?.role === 'host') {
      if (!formData.national_id_or_passport.trim()) {
        newErrors.national_id_or_passport = 'National ID or Passport is required for hosts'
      }

      if (!formData.tin_number.trim()) {
        newErrors.tin_number = 'TIN number is required for hosts'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)

    try {
      if (user) {
        // Only send the fields that have changed
        const updateData = {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          street_address: formData.street_address,
          city: formData.city,
          date_of_birth: formData.date_of_birth,
          national_id_or_passport: formData.national_id_or_passport,
          tin_number: formData.tin_number,
          profile_image_url: formData.profile_image_url
        }
        
        await updateUser(user.id, updateData)
        toast.success('Profile updated successfully!')
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <button 
              onClick={() => router.push('/profile')}
              className="bg-white text-sky-600 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Back to Profile
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Update Your Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex items-center space-x-6">
                  {/* Current Profile Image Preview */}
                  <div className="flex-shrink-0">
                    {formData.profile_image_url ? (
                      <Image 
                        src={formData.profile_image_url} 
                        alt="Profile" 
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-gray-300"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Upload Component */}
                  <div className="flex-1">
                    <ImageUpload
                      images={formData.profile_image_url ? [formData.profile_image_url] : []}
                      onImagesChange={handleImageChange}
                      maxImages={1}
                      bucket="profiles"
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG, or GIF. Max size 20MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="street_address"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.street_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your street address"
                  />
                  {errors.street_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.street_address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                  )}
                </div>

                {user.role === 'host' && (
                  <>
                    <div>
                      <label htmlFor="national_id_or_passport" className="block text-sm font-medium text-gray-700 mb-2">
                        National ID or Passport *
                      </label>
                      <input
                        type="text"
                        id="national_id_or_passport"
                        name="national_id_or_passport"
                        value={formData.national_id_or_passport}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                          errors.national_id_or_passport ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your national ID or passport number"
                      />
                      {errors.national_id_or_passport && (
                        <p className="text-red-500 text-sm mt-1">{errors.national_id_or_passport}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tin_number" className="block text-sm font-medium text-gray-700 mb-2">
                        TIN Number *
                      </label>
                      <input
                        type="text"
                        id="tin_number"
                        name="tin_number"
                        value={formData.tin_number}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                          errors.tin_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your TIN number"
                      />
                      {errors.tin_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.tin_number}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
