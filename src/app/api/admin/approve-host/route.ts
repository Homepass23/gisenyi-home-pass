import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { hostId, status, adminId, adminNotes } = body

    // Validate required fields
    if (!hostId || !status || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Host ID, status, and admin ID are required' },
        { status: 400 }
      )
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      )
    }

    // Find the host approval request
    const { data: approvalRequests, error: requestError } = await supabaseAdmin
      .from('host_approval_requests')
      .select('*')
      .eq('user_id', hostId)
      .eq('status', 'pending')

    if (requestError || !approvalRequests || approvalRequests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pending approval request not found for this host' },
        { status: 404 }
      )
    }

    const approvalRequest = approvalRequests[0]

    // Update the approval request
    const { error: updateRequestError } = await supabaseAdmin
      .from('host_approval_requests')
      .update({
        status,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalRequest.id)

    if (updateRequestError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update approval request' },
        { status: 500 }
      )
    }

    // If approved, update the host's verified status
    if (status === 'approved') {
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({ 
          verified: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', hostId)

      if (updateUserError) {
        return NextResponse.json(
          { success: false, error: 'Failed to update host verification status' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Host approval API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}