import { supabaseAdmin } from './supabaseClient'

/**
 * Email notification helpers for authentication events
 */

// Email templates
const EMAIL_TEMPLATES = {
  verification: {
    subject: 'Verify your Gisenyi Home Pass account',
    body: (name: string, verificationLink: string) => `
      <h2>Welcome to Gisenyi Home Pass, ${name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `
  },
  hostApproval: {
    subject: 'Host Account Approval Status',
    body: (name: string, status: string, notes?: string) => `
      <h2>Host Account Approval Status</h2>
      <p>Hello ${name},</p>
      <p>Your host account has been ${status}.</p>
      ${notes ? `<p>Admin notes: ${notes}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
    `
  },
  passwordReset: {
    subject: 'Reset your Gisenyi Home Pass password',
    body: (name: string, resetLink: string) => `
      <h2>Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  },
  bookingConfirmation: {
    subject: 'Booking Confirmation - Gisenyi Home Pass',
    body: (name: string, accommodationName: string, checkIn: string, checkOut: string, totalAmount: number) => `
      <h2>Booking Confirmation</h2>
      <p>Hello ${name},</p>
      <p>Your booking has been confirmed!</p>
      <p><strong>Accommodation:</strong> ${accommodationName}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p>Thank you for choosing Gisenyi Home Pass!</p>
    `
  }
}

// Log email to database
async function logEmail(to: string, subject: string, body: string, event: string) {
  try {
    const { error } = await supabaseAdmin
      .from('email_logs')
      .insert({
        to_email: to,
        subject,
        body,
        event,
        sent_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log email:', error)
    }
  } catch (error) {
    console.error('Error logging email:', error)
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string, 
  name: string, 
  verificationToken: string,
  userId?: string  // Add userId parameter
) {
  try {
    // In a real implementation, you would integrate with an email service like SendGrid or Resend
    // For now, we'll just log the email and create the verification token
    
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify?token=${verificationToken}`
    
    const subject = EMAIL_TEMPLATES.verification.subject
    const body = EMAIL_TEMPLATES.verification.body(name, verificationLink)
    
    // Log the email
    await logEmail(email, subject, body, 'verification')
    
    // Store verification token in database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours
    
    const { error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: userId || null, // Use provided userId or null
        token: verificationToken,
        expires_at: expiresAt.toISOString()
      })
    
    if (tokenError) {
      console.error('Failed to store verification token:', tokenError)
      return { success: false, error: 'Failed to create verification token' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: 'Failed to send verification email' }
  }
}

// Send host approval notification
export async function sendHostApprovalNotification(
  email: string,
  name: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  try {
    const subject = EMAIL_TEMPLATES.hostApproval.subject
    const body = EMAIL_TEMPLATES.hostApproval.body(name, status, notes)
    
    // Log the email
    await logEmail(email, subject, body, 'host_approval')
    
    return { success: true }
  } catch (error) {
    console.error('Error sending host approval notification:', error)
    return { success: false, error: 'Failed to send host approval notification' }
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`
    
    const subject = EMAIL_TEMPLATES.passwordReset.subject
    const body = EMAIL_TEMPLATES.passwordReset.body(name, resetLink)
    
    // Log the email
    await logEmail(email, subject, body, 'password_reset')
    
    // Store reset token in database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour
    
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: null, // Will be updated when user requests reset
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
    
    if (tokenError) {
      console.error('Failed to store reset token:', tokenError)
      return { success: false, error: 'Failed to create reset token' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: 'Failed to send password reset email' }
  }
}

// Generate a random token
export function generateToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(
  email: string,
  name: string,
  accommodationName: string,
  checkIn: string,
  checkOut: string,
  totalAmount: number
) {
  try {
    const subject = EMAIL_TEMPLATES.bookingConfirmation.subject
    const body = EMAIL_TEMPLATES.bookingConfirmation.body(name, accommodationName, checkIn, checkOut, totalAmount)
    
    // Log the email
    await logEmail(email, subject, body, 'booking_confirmation')
    
    return { success: true }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    return { success: false, error: 'Failed to send booking confirmation email' }
  }
}