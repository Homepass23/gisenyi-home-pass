'use client'

import React, { useState, useEffect } from 'react'
import { Accommodation } from '../../../lib/supabaseHelpers'
import ImageUpload from '../../components/shared/ImageUpload'
import RoomManagement from './RoomManagement'
import { Plus } from 'lucide-react'
import { supabaseAdmin } from '../../../lib/supabaseClient'

interface HostBasicInfo {
  id: string
  full_name: string | null
  email: string
  role: string
  verified: boolean
}

interface AccommodationFormProps {
  accommodation?: Accommodation | null
  onSubmit: (data: Partial<Accommodation>) => Promise<void>
  onCancel: () => void
}

export default function AccommodationForm({ accommodation, onSubmit, onCancel }: AccommodationFormProps) {
  const [formData, setFormData] = useState<Partial<Accommodation>>({
    title: '',
    description: '',
    type: 'house',
    location: '',
    latitude: null,
    longitude: null,
    price_per_night: 0,
    num_of_guests: 1,
    num_of_rooms: 1,
    num_of_bathrooms: 1,
    amenities: [],
    cancellation_policy: 'partial',
    allow_independent_room_booking: false,
    rating: 0,
    owner_id: '',
    ...accommodation
  })
  
  const [amenitiesInput, setAmenitiesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [showRoomManagement, setShowRoomManagement] = useState(false)
  const [activeHosts, setActiveHosts] = useState<HostBasicInfo[]>([])
  const [loadingHosts, setLoadingHosts] = useState(false)

  useEffect(() => {
    if (accommodation) {
      setFormData({
        ...accommodation,
        amenities: accommodation.amenities || []
      })
      setAmenitiesInput(accommodation.amenities?.join(', ') || '')
      // Load existing gallery images if any
      if (accommodation.id) {
        loadGalleryImages(accommodation.id)
      }
    }
    fetchActiveHosts()
  }, [accommodation])

  const fetchActiveHosts = async () => {
    try {
      setLoadingHosts(true)
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, role, verified')
        .eq('role', 'host')
        .eq('verified', true)
        .order('full_name', { ascending: true })
      
      if (error) throw error
      setActiveHosts(data || [])
    } catch (error) {
      console.error('Error fetching active hosts:', error)
      setError('Failed to load hosts. Please try again.')
    } finally {
      setLoadingHosts(false)
    }
  }

  const loadGalleryImages = async (accommodationId: string) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('accommodation_gallery')
        .select('image_url')
        .eq('accommodation_id', accommodationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setGalleryImages(data?.map((item: { image_url: string }) => item.image_url) || [])
    } catch (error) {
      console.error('Error loading gallery images:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmenitiesInput(e.target.value)
    const amenitiesArray = e.target.value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      amenities: amenitiesArray
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!formData.owner_id) {
        setError('Please select an owner/host for this accommodation.')
        setLoading(false)
        return
      }
      
      // Call the onSubmit function and get the result
      const result = await onSubmit(formData)
      
      // If accommodation was created/updated successfully, save gallery images
      // The result might be the accommodation data or undefined
      // We need to get the accommodation ID either from result or from existing accommodation
      const accommodationId = (result as Accommodation | undefined)?.id || accommodation?.id
      
      if (accommodationId && galleryImages.length > 0) {
        await saveGalleryImages(accommodationId)
      }
      
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const saveGalleryImages = async (accommodationId: string) => {
    try {
      // Delete existing gallery images
      await supabaseAdmin
        .from('accommodation_gallery')
        .delete()
        .eq('accommodation_id', accommodationId)

      // Insert new gallery images
      if (galleryImages.length > 0) {
        const galleryData = galleryImages.map(imageUrl => ({
          accommodation_id: accommodationId,
          image_url: imageUrl
        }))

        const { error } = await supabaseAdmin
          .from('accommodation_gallery')
          .insert(galleryData)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error saving gallery images:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type || 'house'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="house">House</option>
            <option value="room">Room</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-1">
          Owner/Host *
        </label>
        <select
          id="owner_id"
          name="owner_id"
          value={formData.owner_id || ''}
          onChange={handleChange}
          required
          disabled={loadingHosts}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingHosts ? 'Loading hosts...' : 'Select a host'}
          </option>
          {activeHosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.full_name} ({host.email})
            </option>
          ))}
        </select>
        {activeHosts.length === 0 && !loadingHosts && (
          <p className="mt-1 text-sm text-amber-600">
            No active hosts available. Please ensure hosts are verified before creating accommodations.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-1">
            Price per Night (RWF) *
          </label>
          <input
            type="number"
            id="price_per_night"
            name="price_per_night"
            value={formData.price_per_night || 0}
            onChange={handleChange}
            min="0"
            step="1000"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="num_of_guests" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests *
          </label>
          <input
            type="number"
            id="num_of_guests"
            name="num_of_guests"
            value={formData.num_of_guests || 1}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="num_of_rooms" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Rooms *
          </label>
          <input
            type="number"
            id="num_of_rooms"
            name="num_of_rooms"
            value={formData.num_of_rooms || 1}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="num_of_bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Bathrooms
          </label>
          <input
            type="number"
            id="num_of_bathrooms"
            name="num_of_bathrooms"
            value={formData.num_of_bathrooms || 1}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="cancellation_policy" className="block text-sm font-medium text-gray-700 mb-1">
            Cancellation Policy
          </label>
          <select
            id="cancellation_policy"
            name="cancellation_policy"
            value={formData.cancellation_policy || 'partial'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="free">Free</option>
            <option value="partial">Partial</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">
          Amenities (comma separated)
        </label>
        <input
          type="text"
          id="amenities"
          value={amenitiesInput}
          onChange={handleAmenitiesChange}
          placeholder="WiFi, Pool, Parking, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {formData.amenities && formData.amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="allow_independent_room_booking"
          name="allow_independent_room_booking"
          checked={formData.allow_independent_room_booking || false}
          onChange={handleChange}
          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
        />
        <label htmlFor="allow_independent_room_booking" className="ml-2 block text-sm text-gray-700">
          Allow independent room booking
        </label>
      </div>

      {/* Room Management Section */}
      {formData.allow_independent_room_booking && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Room Management</h3>
            {accommodation?.id && (
              <button
                type="button"
                onClick={() => setShowRoomManagement(true)}
                className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manage Rooms
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {accommodation?.id 
              ? "Click 'Manage Rooms' to add and manage individual rooms for this accommodation."
              : "Save the accommodation first, then you can manage individual rooms."
            }
          </p>
        </div>
      )}

      {/* Image Upload Section */}
      <ImageUpload
        images={galleryImages}
        onImagesChange={setGalleryImages}
        maxImages={10}
        bucket="accommodations"
        className="border-t pt-6"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : accommodation ? 'Update Accommodation' : 'Create Accommodation'}
        </button>
      </div>

      {/* Room Management Modal */}
      {showRoomManagement && accommodation?.id && (
        <RoomManagement
          accommodationId={accommodation.id}
          accommodationTitle={accommodation.title}
          onClose={() => setShowRoomManagement(false)}
        />
      )}
    </form>
  )
}