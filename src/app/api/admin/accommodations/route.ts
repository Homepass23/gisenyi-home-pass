import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/rbac'
import { createAccommodation, updateAccommodation, deleteAccommodation } from '../../../../lib/supabaseHelpers'
import { supabaseAdmin } from '../../../../lib/supabaseClient'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    let query = supabaseAdmin.from('accommodations').select('*').order('created_at', { ascending: false })
    if (ownerId) query = query.eq('owner_id', ownerId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const data = await createAccommodation(body)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ success: false, error: 'Accommodation id required' }, { status: 400 })
    const data = await updateAccommodation(id, rest)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Accommodation id required' }, { status: 400 })
    await deleteAccommodation(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}



