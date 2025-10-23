'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Bed, Users, Bath, X } from 'lucide-react'
import { AccommodationRoom } from '../../../lib/supabaseHelpers'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import Modal from '../../components/shared/Modal'
import ImageUpload from '../../components/shared/ImageUpload'
import { motion, AnimatePresence } from 'framer-motion'
import AlertDialog from '../../components/ui/AlertDialog'

interface RoomManagementProps {
  accommodationId: string
  accommodationTitle: string
  onClose: () => void
}

interface RoomFormData {
  room_name: string
  description: string
  price_per_night: number
  num_of_guests: number
  num_of_beds: number
  private_bathroom: boolean
  image_gallery: string[]
}

export default function RoomManagement({ accommodationId, accommodationTitle, onClose }: RoomManagementProps) {
  const [rooms, setRooms] = useState<AccommodationRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<AccommodationRoom | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    room_name: '',
    description: '',
    price_per_night: 0,
    num_of_guests: 1,
    num_of_beds: 1,
    private_bathroom: false,
    image_gallery: []
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<{id: string, name: string} | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [accommodationId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseAdmin
        .from('accommodation_rooms')
        .select('*')
        .eq('accommodation_id', accommodationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('Failed to load rooms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = () => {
    setEditingRoom(null)
    setFormData({
      room_name: '',
      description: '',
      price_per_night: 0,
      num_of_guests: 1,
      num_of_beds: 1,
      private_bathroom: false,
      image_gallery: []
    })
    setIsModalOpen(true)
  }

  const handleEditRoom = (room: AccommodationRoom) => {
    setEditingRoom(room)
    setFormData({
      room_name: room.room_name,
      description: room.description || '',
      price_per_night: room.price_per_night,
      num_of_guests: room.num_of_guests || 1,
      num_of_beds: room.num_of_beds || 1,
      private_bathroom: room.private_bathroom || false,
      image_gallery: room.image_gallery || []
    })
    setIsModalOpen(true)
  }

  const handleDeleteRoomClick = (roomId: string, roomName: string) => {
    setRoomToDelete({id: roomId, name: roomName})
    setDeleteDialogOpen(true)
  }

  const handleDeleteRoomConfirm = async () => {
    if (!roomToDelete) return
    try {
      const { error } = await supabaseAdmin
        .from('accommodation_rooms')
        .delete()
        .eq('id', roomToDelete.id)

      if (error) throw error
      toast.success('Room deleted successfully!')
      fetchRooms()
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Failed to delete room. Please try again.')
    } finally {
      setRoomToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      if (editingRoom) {
        // Update existing room
        const { error } = await supabaseAdmin
          .from('accommodation_rooms')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRoom.id)

        if (error) throw error
        toast.success('Room updated successfully!')
      } else {
        // Create new room
        const { error } = await supabaseAdmin
          .from('accommodation_rooms')
          .insert({
            ...formData,
            accommodation_id: accommodationId
          })

        if (error) throw error
        toast.success('Room created successfully!')
      }

      fetchRooms()
      setIsModalOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast.error('Failed to save room. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="room-management"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-[100] p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/40 flex flex-col w-full max-w-4xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg p-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold">Room Management</h2>
              <p className="text-sky-600">{accommodationTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add Room Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateRoom}
                className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Room
              </button>
            </div>

            {/* Rooms List */}
            {loading ? (
              <div className="text-center py-8">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rooms found. Add your first room to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    {/* Room Image */}
                    <div className="aspect-video bg-gray-100 relative">
                      {room.image_gallery && room.image_gallery.length > 0 ? (
                        <img
                          src={room.image_gallery[0]}
                          alt={room.room_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Bed className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{room.room_name}</h3>
                      {room.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {room.num_of_guests} guests
                        </div>
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {room.num_of_beds} beds
                        </div>
                        {room.private_bathroom && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            Private
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-sky-600">
                          Rwf {room.price_per_night.toLocaleString()}/night
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoomClick(room.id, room.room_name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Room Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? "Edit Room" : "Add New Room"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="room_name" className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              id="room_name"
              name="room_name"
              value={formData.room_name}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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
                value={formData.price_per_night}
                onChange={handleFormChange}
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
                value={formData.num_of_guests}
                onChange={handleFormChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="num_of_beds" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Beds
              </label>
              <input
                type="number"
                id="num_of_beds"
                name="num_of_beds"
                value={formData.num_of_beds}
                onChange={handleFormChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="private_bathroom"
              name="private_bathroom"
              checked={formData.private_bathroom}
              onChange={handleFormChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label htmlFor="private_bathroom" className="ml-2 block text-sm text-gray-700">
              Private bathroom
            </label>
          </div>

          <ImageUpload
            images={formData.image_gallery}
            onImagesChange={(images) => setFormData(prev => ({ ...prev, image_gallery: images }))}
            maxImages={5}
            bucket="accommodations"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteRoomConfirm}
        title="Delete Room"
        description={`Are you sure you want to delete the room "${roomToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AnimatePresence>
  )
}