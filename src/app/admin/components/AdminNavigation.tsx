'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Calendar, 
  // BarChart3, 
  Mail,
  LogOut,
  User,
  Key
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function AdminNavigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Accommodations', href: '/admin/accommodations', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    // { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 }, // Dormant until ready
    { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
  ]

  const profileItems = [
    { name: 'Edit Profile', href: '/profile/edit', icon: User },
    { name: 'Change Password', href: '/profile/change-password', icon: Key },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="bg-sky-700 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-sky-200 text-sm">Gisenya Home Pass</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sky-800 text-white' 
                      : 'text-sky-100 hover:bg-sky-600 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="pt-4 border-t border-sky-600">
        <div className="mb-4">
          <h3 className="text-sky-200 text-sm font-semibold mb-2">Profile Settings</h3>
          <ul className="space-y-1">
            {profileItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors text-sm ${
                      isActive 
                        ? 'bg-sky-800 text-white' 
                        : 'text-sky-100 hover:bg-sky-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-sky-100 hover:bg-sky-600 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}