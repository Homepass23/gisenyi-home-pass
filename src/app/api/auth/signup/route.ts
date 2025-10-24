import { NextResponse } from 'next/server'
import { signUpUser } from '../../../../lib/authService'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { 
      email, 
      password, 
      role,
      full_name,
      phone_number,
      street_address,
      city,
      date_of_birth,
      national_id_or_passport,
      tin_number
    } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role (disallow self-registering as admin)
    if (!['host', 'customer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate host-specific fields
    if (role === 'host') {
      if (!full_name || !phone_number || !street_address || !city || !date_of_birth || !national_id_or_passport || !tin_number) {
        return NextResponse.json(
          { success: false, error: 'All fields are required for hosts' },
          { status: 400 }
        )
      }
    }

    // Validate customer-specific fields
    if (role === 'customer') {
      if (!full_name || !phone_number || !street_address || !city || !date_of_birth) {
        return NextResponse.json(
          { success: false, error: 'All fields are required for customers' },
          { status: 400 }
        )
      }
    }

    const result = await signUpUser({
      email,
      password,
      role,
      full_name,
      phone_number,
      street_address,
      city,
      date_of_birth,
      national_id_or_passport: role === 'host' ? national_id_or_passport : undefined,
      tin_number: role === 'host' ? tin_number : undefined
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}