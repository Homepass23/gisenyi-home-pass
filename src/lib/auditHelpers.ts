import { supabaseAdmin } from './supabaseClient'

/**
 * Audit logging helpers
 */

export interface AuditLogData {
  event_type: string;
  success: boolean;
  user_id?: string | null;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

// Create an audit log entry
export async function createAuditLog(logData: AuditLogData) {
  try {
    const { error } = await supabaseAdmin
      .from('auth_audit_logs')
      .insert({
        event_type: logData.event_type,
        success: logData.success,
        user_id: logData.user_id || null,
        ip_address: logData.ip_address || null,
        user_agent: logData.user_agent || null,
        error_message: logData.error_message || null,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Don't throw an error here as it would interrupt the authentication process
      console.warn('Warning: Failed to create audit log (this does not affect authentication):', error.message)
    }
  } catch (error) {
    // Don't throw an error here as it would interrupt the authentication process
    console.warn('Warning: Error creating audit log (this does not affect authentication):', (error as Error).message)
  }
}

// Get audit logs for a user
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('auth_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch user audit logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    return []
  }
}

// Get recent audit logs
export async function getRecentAuditLogs(limit: number = 100) {
  try {
    const { data, error } = await supabaseAdmin
      .from('auth_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch recent audit logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recent audit logs:', error)
    return []
  }
}