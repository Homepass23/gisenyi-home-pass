'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabaseClient'
import { Accommodation } from '../../../lib/supabaseHelpers'
import Modal from '../../components/shared/Modal'
import AccommodationForm from '../../admin/components/AccommodationForm'
import AlertDialog from '../../components/ui/AlertDialog'
import { toast } from 'sonner'

export default function OwnerAccommodations() {
  const { user } = useAuth()
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accommodationToDelete, setAccommodationToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchAccommodations()
  }, [user])

  const fetchAccommodations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .eq('owner_id', user?.id || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccommodations(data || [])
    } catch (e) {
      console.error('Failed to load accommodations', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAccommodation(null)
    setIsModalOpen(true)
  }

  const handleEdit = (acc: Accommodation) => {
    setEditingAccommodation(acc)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setAccommodationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !accommodationToDelete) return
    try {
      const { error } = await supabase
        .from('accommodations')
        .delete()
        .eq('id', accommodationToDelete)
        .eq('owner_id', user.id)
      if (error) throw error
      fetchAccommodations()
    } catch (e) {
      console.error('Failed to delete accommodation', e)
      toast.error('Failed to delete accommodation')
    } finally {
      setAccommodationToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSaveAccommodation = async (data: Partial<Accommodation>) => {
    if (!user) return
    if (editingAccommodation) {
      // Update existing, enforce ownership
      const { error } = await supabase
        .from('accommodations')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingAccommodation.id)
        .eq('owner_id', user.id)
      if (error) throw error
    } else {
      // Create new with owner association
      const { error } = await supabase
        .from('accommodations')
        .insert({ ...data, owner_id: user.id })
      if (error) throw error
    }
    await fetchAccommodations()
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return accommodations.filter(a =>
      (a.title || '').toLowerCase().includes(term) ||
      (a.location || '').toLowerCase().includes(term)
    )
  }, [accommodations, searchTerm])

  return (
    <ProtectedRoute requiredRole="host">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Accommodations</h1>
            <button onClick={handleCreate} className="bg-white text-sky-600 px-4 py-2 rounded-md hover:bg-gray-100">Add New</button>
          </div>
        </div>

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
              <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center gap-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-6 text-center">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No accommodations found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(acc => (
                          <tr key={acc.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rwf {(acc.price_per_night || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-3">
                                <button onClick={() => handleEdit(acc)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                <button onClick={() => handleDeleteClick(acc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
          title={editingAccommodation ? 'Edit Accommodation' : 'Create Accommodation'}
          size="lg"
        >
          <AccommodationForm
            accommodation={editingAccommodation}
            onSubmit={handleSaveAccommodation}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        <AlertDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Accommodation"
          description="Are you sure you want to delete this accommodation? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  )
}