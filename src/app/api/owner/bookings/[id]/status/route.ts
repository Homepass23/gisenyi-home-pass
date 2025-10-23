import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabaseClient'



// Hosts can update status of bookings that belong to their accommodations
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id
    const body = await request.json()
    const { status } = body as { status?: 'confirmed' | 'rejected' | 'cancelled' }

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: 'booking id and status are required' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'invalid status' },
        { status: 400 }
      )
    }

    // Identify current user via session cookie
    const cookie = request.headers.get('cookie') || ''
    const token = cookie
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith('sb-access-token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !userData?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id

    // Fetch booking and its accommodation to verify ownership
    const { data: bookings, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .select(`id, accommodation_id, status, accommodations!inner(owner_id)`) // inner join ensures accommodation exists
      .eq('id', bookingId)
      .limit(1)

    if (bookingErr || !bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    // Extract owner_id from joined accommodations table
    // The accommodations property is an array due to the join, so we access the first element
    const bookingData = bookings[0] as unknown
    const accommodationsArray = (bookingData as { accommodations: Array<{ owner_id: string }> }).accommodations
    const ownerId = accommodationsArray && accommodationsArray.length > 0 
      ? accommodationsArray[0].owner_id 
      : undefined
      
    if (!ownerId || ownerId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Update booking status
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()

    if (updateErr) {
      return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updated?.[0] })
  } catch (error) {
    console.error('Owner update booking status error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
