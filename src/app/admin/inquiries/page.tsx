'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import AdminNavigation from '../components/AdminNavigation'
import { supabaseAdmin } from '../../../lib/supabaseClient'
import { Eye, Reply, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'responded' | 'closed'
  response: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function InquiriesManagement() {
  const { user } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [responseText, setResponseText] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseAdmin
        .from('customer_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInquiries(data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setResponseText(inquiry.response || '')
  }

  const handleUpdateStatus = async (status: 'responded' | 'closed') => {
    if (!selectedInquiry) return

    try {
      setUpdating(true)
      
      const updateData: Partial<Inquiry> = { status }
      
      if (status === 'responded' && responseText.trim()) {
        updateData.response = responseText.trim()
        updateData.responded_at = new Date().toISOString()
      }
      
      const { error } = await supabaseAdmin
        .from('customer_inquiries')
        .update(updateData)
        .eq('id', selectedInquiry.id)

      if (error) throw error

      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { ...inquiry, ...updateData, updated_at: new Date().toISOString() } 
          : inquiry
      ))

      if (selectedInquiry) {
        setSelectedInquiry({ ...selectedInquiry, ...updateData, updated_at: new Date().toISOString() })
      }

      toast.success(`Inquiry status updated to ${status}`)
    } catch (error) {
      console.error('Error updating inquiry:', error)
      toast.error('Failed to update inquiry status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'responded': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="mt-21 flex min-h-screen bg-gray-50">
        <AdminNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-sky-600 text-white p-4 shadow-md">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Customer Inquiries</h1>
              <div className="flex items-center space-x-4">
                <span>Welcome, {user?.full_name || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedInquiry ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="text-sky-600 hover:text-sky-800 font-medium"
                  >
                    ← Back to all inquiries
                  </button>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInquiry.status)}`}>
                    {getStatusIcon(selectedInquiry.status)}
                    <span className="ml-1 capitalize">{selectedInquiry.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedInquiry.subject}</h2>
                    <p className="text-gray-600 mb-4">{selectedInquiry.message}</p>
                    
                    <div className="space-y-2">
                      <p><span className="font-medium">From:</span> {selectedInquiry.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedInquiry.email}</p>
                      {selectedInquiry.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedInquiry.phone}</p>
                      )}
                      <p><span className="font-medium">Submitted:</span> {formatDate(selectedInquiry.created_at)}</p>
                      {selectedInquiry.responded_at && (
                        <p><span className="font-medium">Responded:</span> {formatDate(selectedInquiry.responded_at)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Respond to Inquiry</h3>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response here..."
                      className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      disabled={updating}
                    />
                    
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleUpdateStatus('responded')}
                        disabled={updating}
                        className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        {updating ? 'Sending...' : 'Send Response'}
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus('closed')}
                        disabled={updating}
                        className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Inquiry
                      </button>
                    </div>
                  </div>
                </div>

                {selectedInquiry.response && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Previous Response</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700">{selectedInquiry.response}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">All Customer Inquiries</h2>
                  <p className="text-gray-600">Manage and respond to customer inquiries</p>
                </div>

                {loading ? (
                  <div className="p-6">
                    <p className="text-gray-500">Loading inquiries...</p>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No inquiries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{inquiry.email}</div>
                              {inquiry.phone && (
                                <div className="text-sm text-gray-500">{inquiry.phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{inquiry.subject}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{inquiry.message.substring(0, 50)}...</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatShortDate(inquiry.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                                {getStatusIcon(inquiry.status)}
                                <span className="ml-1 capitalize">{inquiry.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewInquiry(inquiry)}
                                className="flex items-center text-sky-600 hover:text-sky-900"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}