import { NextResponse } from 'next/server'
import { signOutUser } from '../../../../lib/authService'

export async function POST() {
  try {
    const result = await signOutUser()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}