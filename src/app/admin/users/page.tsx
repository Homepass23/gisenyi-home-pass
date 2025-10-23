'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  UserCheck, 
  UserX, 
  Search,
  Plus,
  Edit,
  ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import { User } from '../../../lib/supabaseHelpers'
import Modal from '../../components/shared/Modal'
import UserForm from '../components/UserForm'
import AlertDialog from '../../components/ui/AlertDialog'

export default function UserManagement() {
  const { user } = useAuth()
  const router = useRouter() // Add router for navigation
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'host' | 'customer'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<{id: string, name: string} | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleApproveHost = async (id: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ verified: true })
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      // Refresh the list
      fetchUsers()
    } catch (error) {
      console.error('Error approving host:', error)
      toast.error('Failed to approve host. Please try again.')
    }
  }

  const handleDeactivateUserClick = (id: string, name: string) => {
    setUserToDeactivate({id, name})
    setDeleteDialogOpen(true)
  }

  const handleDeactivateUserConfirm = async () => {
    if (!userToDeactivate) return
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ verified: false })
        .eq('id', userToDeactivate.id)
        .select()
      
      if (error) throw error
      
      // Refresh the list
      fetchUsers()
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error('Failed to deactivate user. Please try again.')
    } finally {
      setUserToDeactivate(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSaveUser = async (data: Partial<User>) => {
    try {
      // Prevent creating new admin users
      if (!editingUser && data.role === 'admin') {
        toast.error('Admins cannot create new admin users. Please choose Host or Customer.');
        throw new Error('Creating admin users is not permitted');
      }
      if (editingUser) {
        // Update existing user
        const { error } = await supabaseAdmin
          .from('users')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingUser.id)
        
        if (error) throw error
      } else {
        // Create new user
        const { error } = await supabaseAdmin
          .from('users')
          .insert(data)
        
        if (error) throw error
      }
      
      // Refresh the list
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      throw error
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'host': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (verified: boolean) => {
    return verified 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const handleFilterRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value as 'all' | 'admin' | 'host' | 'customer')
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="mt-21 min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin')} // Add back button
                className="flex items-center text-white hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Header with Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">All Users</h2>
                <p className="text-gray-600">Manage users, hosts, and customers</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={filterRole}
                  onChange={handleFilterRoleChange}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="host">Hosts</option>
                  <option value="customer">Customers</option>
                </select>
                
                <button 
                  onClick={handleCreateUser}
                  className="flex items-center justify-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{userData.full_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(userData.role)}`}>
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(userData.verified)}`}>
                              {userData.verified ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userData.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditUser(userData)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {userData.role === 'host' && !userData.verified && (
                                <button 
                                  onClick={() => handleApproveHost(userData.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeactivateUserClick(userData.id, userData.full_name || 'N/A')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No users found
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
      
      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create New User"}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSaveUser}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeactivateUserConfirm}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${userToDeactivate?.name}? This action cannot be undone.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="destructive"
      />
    </ProtectedRoute>
  )
}