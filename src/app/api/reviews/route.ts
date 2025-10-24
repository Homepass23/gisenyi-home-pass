import { NextResponse } from 'next/server'
import { createNewReview } from '../../../lib/newReviewHelpers'
import { supabaseAdmin } from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accommodation_id, rating, comment } = body

    if (!accommodation_id || !rating) {
      return NextResponse.json({ success: false, error: 'accommodation_id and rating are required' }, { status: 400 })
    }

    // Identify current user via session cookie
    const cookie = request.headers.get('cookie') || ''
    const token = cookie.split(';').map(v => v.trim()).find(v => v.startsWith('sb-access-token='))?.split('=')[1]
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { data: userData, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !userData?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = userData.user.id

    const review = await createNewReview({ accommodation_id, rating, comment }, userId)
    return NextResponse.json({ success: true, data: review })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ success: false, error: message }, { status })
  }
}



