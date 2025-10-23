import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabaseClient'

export async function requireAdmin(request: Request): Promise<{ userId: string }>{
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  if (!accessToken) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
  if (error || !data?.user) {
    throw new Error('Unauthorized')
  }

  const userId = data.user.id
  const { data: roles, error: roleError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .limit(1)

  if (roleError || !roles || roles.length === 0 || roles[0].role !== 'admin') {
    throw new Error('Forbidden')
  }

  return { userId }
}



