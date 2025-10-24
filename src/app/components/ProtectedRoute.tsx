'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { UserRole } from '../../lib/supabaseHelpers'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      setIsRedirecting(true)
      router.push(redirectTo)
      return
    }
    
    // Check role requirements
    if (requiredRole) {
      const hasRequiredRole = Array.isArray(requiredRole) 
        ? requiredRole.includes(user.role)
        : user.role === requiredRole
      
      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user role
        setIsRedirecting(true)
        const roleRedirect = user.role === 'admin' ? '/admin' : 
                           user.role === 'host' ? '/owner' : 
                           '/customer'
        router.push(roleRedirect)
      }
    }
  }, [user, loading, router, requiredRole, redirectTo])

  // Show loading state while checking auth or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  // If user exists and meets role requirements (if any), render children
  if (user) {
    // If no role requirement, allow access
    if (!requiredRole) return <>{children}</>
    
    // Check role requirement
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole
    
    if (hasRequiredRole) {
      return <>{children}</>
    }
  }

  // User doesn't meet requirements or isn't logged in
  return null
}

export default ProtectedRoute