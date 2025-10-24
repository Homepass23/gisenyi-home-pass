import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { token } = body

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find the verification token
    const { data: verificationTokens, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)

    if (tokenError || !verificationTokens || verificationTokens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const verificationToken = verificationTokens[0]

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(verificationToken.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update user as verified
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq('id', verificationToken.user_id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    // Delete the used token
    await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('id', verificationToken.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for email verification links
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    // Validate required fields
    if (!token) {
      return NextResponse.redirect(new URL('/verify?error=missing_token', request.url))
    }

    // For signup confirmations, redirect to our custom verification page
    if (type === 'signup') {
      const verificationUrl = new URL('/verify', request.url)
      verificationUrl.searchParams.set('token', token)
      return NextResponse.redirect(verificationUrl)
    }

    // For other types, redirect to login with error
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'invalid_verification_link')
    return NextResponse.redirect(loginUrl)
  } catch (error) {
    console.error('Verification GET error:', error)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'verification_error')
    return NextResponse.redirect(loginUrl)
  }
}