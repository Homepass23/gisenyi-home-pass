'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  TrendingUp, 
  Users, 
  Home,
  Calendar,
  DollarSign
} from 'lucide-react'
import { supabaseAdmin } from '../../../lib/supabaseClient'

/*
 * NOTE: This analytics feature is currently dormant.
 * It will be activated when ready.
 * To activate, uncomment the relevant sections in:
 * 1. src/app/admin/page.tsx (main dashboard)
 * 2. src/app/admin/components/AdminNavigation.tsx (navigation)
 * 3. Remove this comment block
 */

interface ChartData {
  date: string;
  count?: number;
  amount?: number;
  rate?: number;
}

interface AnalyticsData {
  bookings: {
    total: number;
    trend: string;
    data: ChartData[];
  };
  revenue: {
    total: number;
    trend: string;
    data: ChartData[];
  };
  users: {
    total: number;
    trend: string;
    data: ChartData[];
  };
  occupancy: {
    rate: number;
    trend: string;
    data: ChartData[];
  };
}

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    bookings: {
      total: 0,
      trend: '+0%',
      data: []
    },
    revenue: {
      total: 0,
      trend: '+0%',
      data: []
    },
    users: {
      total: 0,
      trend: '+0%',
      data: []
    },
    occupancy: {
      rate: 0,
      trend: '+0%',
      data: []
    }
  })
  const [loading, setLoading] = useState(true)

  // Calculate date range for queries
  const getDateRange = useCallback(() => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    return { startDate, endDate }
  }, [dateRange])

  // Helper function to calculate trend
  const calculateTrend = useCallback((data: { created_at: string }[]) => {
    if (data.length === 0) return '+0%'
    
    // Simplified trend calculation - compare first and second half
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint).length
    const secondHalf = data.slice(midpoint).length
    
    if (firstHalf === 0) return '+0%'
    
    const percentage = Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
    return `${percentage >= 0 ? '+' : ''}${percentage}%`
  }, [])

  // Helper function to generate chart data
  const generateChartData = useCallback((data: { created_at: string; accommodation_id?: string }[], type: string, accommodations?: { id: string; price_per_night: number }[]) => {
    // Group data by date
    const grouped: Record<string, number> = {}
    
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = 0
      }
      
      if (type === 'amount' && accommodations) {
        // Find accommodation price for this booking
        const accommodation = accommodations.find(acc => acc.id === item.accommodation_id)
        if (accommodation) {
          grouped[date] += parseFloat(accommodation.price_per_night.toString())
        }
      } else {
        grouped[date] += 1
      }
    })
    
    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, value]) => ({
        date,
        [type]: value
      } as ChartData))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()
      
      // Fetch bookings data
      const { data: bookingsData } = await supabaseAdmin
        .from('bookings')
        .select('id, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      // Calculate bookings stats
      const totalBookings = bookingsData?.length || 0
      const bookingsTrend = calculateTrend(bookingsData || [])
      
      // Generate bookings chart data
      const bookingsChartData = generateChartData(bookingsData || [], 'count')
      
      // Fetch revenue data
      const { data: revenueBookings } = await supabaseAdmin
        .from('bookings')
        .select('accommodation_id, created_at')
        .eq('status', 'confirmed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      let totalRevenue = 0
      const revenueChartData: ChartData[] = []
      
      if (revenueBookings && revenueBookings.length > 0) {
        // Get accommodation IDs
        const accommodationIds = revenueBookings.map(booking => booking.accommodation_id)
        
        // Fetch accommodation prices
        const { data: accommodations } = await supabaseAdmin
          .from('accommodations')
          .select('id, price_per_night')
          .in('id', accommodationIds)
        
        if (accommodations) {
          // Calculate total revenue
          totalRevenue = accommodations.reduce((sum, acc) => sum + parseFloat(acc.price_per_night.toString()), 0)
          
          // Generate revenue chart data
          revenueChartData.push(...generateChartData(revenueBookings, 'amount', accommodations))
        }
      }
      
      const revenueTrend = calculateTrend(revenueBookings || [])
      
      // Fetch users data
      const { data: usersData } = await supabaseAdmin
        .from('users')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      const totalUsers = usersData?.length || 0
      const usersTrend = calculateTrend(usersData || [])
      const usersChartData = generateChartData(usersData || [], 'count')
      
      // Calculate occupancy rate (simplified)
      const occupancyRate = bookingsData && bookingsData.length > 0 
        ? Math.min(100, Math.round((bookingsData.filter(b => b.status === 'confirmed').length / bookingsData.length) * 100))
        : 0
      const occupancyTrend = '+0%' // Simplified
      
      // Generate occupancy chart data (simplified)
      const occupancyChartData = bookingsChartData.map(item => ({
        ...item,
        rate: item.count ? Math.min(100, item.count * 10) : 0 // Simplified calculation
      }))
      
      setAnalyticsData({
        bookings: {
          total: totalBookings,
          trend: bookingsTrend,
          data: bookingsChartData
        },
        revenue: {
          total: totalRevenue,
          trend: revenueTrend,
          data: revenueChartData
        },
        users: {
          total: totalUsers,
          trend: usersTrend,
          data: usersChartData
        },
        occupancy: {
          rate: occupancyRate,
          trend: occupancyTrend,
          data: occupancyChartData
        }
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [getDateRange, calculateTrend, generateChartData])

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value as '7d' | '30d' | '90d' | '1y')
  }

  useEffect(() => {
    fetchData()
  }, [dateRange, fetchData])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-sky-600 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.full_name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Date Range Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Business Analytics</h2>
                <p className="text-gray-600">Performance metrics and insights</p>
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{loading ? '...' : analyticsData.bookings.total}</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {analyticsData.bookings.trend}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-sky-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Revenue (RWF)</p>
                  <p className="text-2xl font-bold">{loading ? '...' : analyticsData.revenue.total.toLocaleString()}</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {analyticsData.revenue.trend}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-sky-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">New Users</p>
                  <p className="text-2xl font-bold">{loading ? '...' : analyticsData.users.total}</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {analyticsData.users.trend}
                  </p>
                </div>
                <Users className="h-8 w-8 text-sky-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{loading ? '...' : `${analyticsData.occupancy.rate}%`}</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {analyticsData.occupancy.trend}
                  </p>
                </div>
                <Home className="h-8 w-8 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-sky-600 mr-2" />
                <h3 className="text-lg font-semibold">Bookings Trend</h3>
              </div>
              <div className="h-64 flex items-end justify-between border-b border-l border-gray-200 pb-4 pl-4">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p>Loading chart...</p>
                  </div>
                ) : analyticsData.bookings.data.length > 0 ? (
                  analyticsData.bookings.data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 px-1">
                      <div 
                        className="w-full bg-sky-600 rounded-t hover:bg-sky-700 transition-colors"
                        style={{ height: `${Math.min(100, (item.count || 0) * 10)}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-sky-600 mr-2" />
                <h3 className="text-lg font-semibold">Revenue Trend</h3>
              </div>
              <div className="h-64 flex items-end justify-between border-b border-l border-gray-200 pb-4 pl-4">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p>Loading chart...</p>
                  </div>
                ) : analyticsData.revenue.data.length > 0 ? (
                  analyticsData.revenue.data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 px-1">
                      <div 
                        className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors"
                        style={{ height: `${Math.min(100, ((item.amount || 0) / 100000))}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Reports */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Detailed Reports</h2>
              <p className="text-gray-600">Download comprehensive reports</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-2">Booking Report</h3>
                <p className="text-sm text-gray-600 mb-3">Detailed booking history and trends</p>
                <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
                  Download CSV
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-2">Revenue Report</h3>
                <p className="text-sm text-gray-600 mb-3">Financial performance and income breakdown</p>
                <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
                  Download CSV
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-2">User Growth Report</h3>
                <p className="text-sm text-gray-600 mb-3">Customer acquisition and retention metrics</p>
                <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}