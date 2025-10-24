import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabaseClient'

/**
 * Middleware for role-based access control
 */

// Define protected routes and their required roles
const protectedRoutes: { [key: string]: string[] } = {
  '/admin': ['admin'],
  '/owner': ['host'],
  '/customer': ['customer'],
  '/bookings': ['customer'],
  '/profile': ['admin', 'host', 'customer']
}

// Helper function to get user role from session
async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    // Check if user exists
    if (!data || data.length === 0) {
      console.error('User not found in database');
      return null;
    }

    return data[0]?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )

  if (!protectedRoute) {
    // Not a protected route, allow access
    return NextResponse.next()
  }

  // Get the required roles for this route
  const requiredRoles = protectedRoutes[protectedRoute]

  // Get the session token from cookies
  const sessionToken = request.cookies.get('sb-access-token')?.value

  if (!sessionToken) {
    // No session token, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verify the session with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionToken)

  if (error || !user) {
    // Invalid session, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Get user role
  const userRole = await getUserRole(user.id)

  if (!userRole || !requiredRoles.includes(userRole)) {
    // User doesn't have the required role
    const url = request.nextUrl.clone()
    // Redirect to appropriate dashboard based on user role
    if (userRole === 'admin') {
      url.pathname = '/admin'
    } else if (userRole === 'host') {
      url.pathname = '/owner'
    } else if (userRole === 'customer') {
      url.pathname = '/accommodations'
    } else {
      url.pathname = '/login'
    }
    return NextResponse.redirect(url)
  }

  // User has the required role, allow access
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/customer/:path*',
    '/bookings/:path*',
    '/profile/:path*'
  ]
}