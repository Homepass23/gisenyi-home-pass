'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'sonner'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Bed
} from 'lucide-react'
import AdminNavigation from '../components/AdminNavigation'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import { Accommodation } from '../../../lib/supabaseHelpers'
import Modal from '../../components/shared/Modal'
import AccommodationForm from '../components/AccommodationForm'
import RoomManagement from '../components/RoomManagement'
import AlertDialog from '../../components/ui/AlertDialog'

const getUid = (maybeId?: string, fallbackSeed?: string) => {
  if (maybeId && typeof maybeId === 'string' && maybeId.trim() !== '') return maybeId.trim()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `temp-${crypto.randomUUID()}`
  return `temp-${(fallbackSeed || '')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function AccommodationsManagement() {
  const { user } = useAuth()
  const [accommodations, setAccommodations] = useState<(Accommodation & { _uid: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null)
  const [showRoomManagement, setShowRoomManagement] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation & { _uid?: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accommodationToDelete, setAccommodationToDelete] = useState<{id: string, title: string} | null>(null)

  useEffect(() => {
    fetchAccommodations()
  }, [])

  const fetchAccommodations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseAdmin
        .from('accommodations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      const normalized = (data || []).map((acc) => ({
        ...acc,
        _uid: getUid(acc.id, acc.title || 'acc')
      }))
      
      setAccommodations(normalized)
    } catch (error) {
      console.error('Error fetching accommodations:', error)
      toast.error('Failed to load accommodations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccommodation = () => {
    setEditingAccommodation(null)
    setIsModalOpen(true)
  }

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setEditingAccommodation(accommodation)
    setIsModalOpen(true)
  }

  const handleManageRooms = (accommodation: Accommodation & { _uid?: string }) => {
    setSelectedAccommodation(accommodation)
    setShowRoomManagement(true)
  }

  const handleDeleteClick = (id: string, title: string) => {
    setAccommodationToDelete({id, title})
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!accommodationToDelete) return
    try {
      const { error } = await supabaseAdmin
        .from('accommodations')
        .delete()
        .eq('id', accommodationToDelete.id)
      
      if (error) throw error
      
      toast.success('Accommodation deleted successfully!')
      fetchAccommodations()
    } catch (error) {
      console.error('Error deleting accommodation:', error)
      toast.error('Failed to delete accommodation. Please try again.')
    } finally {
      setAccommodationToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSaveAccommodation = async (data: Partial<Accommodation>) => {
    try {
      let result;
      if (editingAccommodation) {
        const { data: updatedData, error } = await supabaseAdmin
          .from('accommodations')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingAccommodation.id)
          .select()
        
        if (error) throw error
        result = updatedData?.[0]
        toast.success('Accommodation updated successfully!')
      } else {
        const { data: createdData, error } = await supabaseAdmin
          .from('accommodations')
          .insert(data)
          .select()
        
        if (error) throw error
        result = createdData?.[0]
        toast.success('Accommodation created successfully!')
      }
      
      await fetchAccommodations()
      return result
    } catch (error) {
      console.error('Error saving accommodation:', error)
      toast.error('Failed to save accommodation. Please try again.')
      throw error
    }
  }

  const filteredAccommodations = accommodations.filter(acc => 
    (acc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-gray-50">
        <AdminNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-sky-600 text-white p-4 shadow-md">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Accommodations Management</h1>
              <div className="flex items-center space-x-4">
                <span>Welcome, {user?.full_name || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">All Accommodations</h2>
                  <p className="text-gray-600">Manage all property listings</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search accommodations..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={handleCreateAccommodation}
                    className="flex items-center justify-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <p>Loading accommodations...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAccommodations.length > 0 ? (
                        filteredAccommodations.map((accommodation) => (
                          <tr key={accommodation._uid}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{accommodation.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {accommodation.location || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Rwf {accommodation.price_per_night?.toLocaleString?.() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {accommodation.rating ?? '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {accommodation.created_at ? new Date(accommodation.created_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEditAccommodation(accommodation)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit accommodation"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                {accommodation.allow_independent_room_booking && (
                                  <button 
                                    onClick={() => handleManageRooms(accommodation)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Manage rooms"
                                  >
                                    <Bed className="h-4 w-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteClick(accommodation.id, accommodation.title)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete accommodation"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            No accommodations found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccommodation ? "Edit Accommodation" : "Create New Accommodation"}
        size="lg"
      >
        <AccommodationForm
          accommodation={editingAccommodation}
          onSubmit={handleSaveAccommodation}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {showRoomManagement && selectedAccommodation && (
        <RoomManagement
          accommodationId={selectedAccommodation.id}
          accommodationTitle={selectedAccommodation.title}
          onClose={() => {
            setShowRoomManagement(false)
            setSelectedAccommodation(null)
          }}
        />
      )}

      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Accommodation"
        description={`Are you sure you want to delete "${accommodationToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </ProtectedRoute>
  )
}
