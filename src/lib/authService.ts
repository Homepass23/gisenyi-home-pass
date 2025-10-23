import { supabase, supabaseAdmin } from './supabaseClient';
import { User as AppUser, UserRole } from './supabaseHelpers';
import { 
  SignUpResponse, 
  SignInResponse, 
  SignOutResponse 
} from './authTypes';
import { createAuditLog } from './auditHelpers';
import { sendVerificationEmail, generateToken } from './emailHelpers';

/**
 * Authentication Service
 * Handles all authentication-related operations
 */

// Sign up a new user
export async function signUpUser(userData: {
  email: string;
  password: string;
  role: UserRole;
  full_name?: string;
  phone_number?: string;
  street_address?: string;
  city?: string;
  date_of_birth?: string;
  national_id_or_passport?: string;
  tin_number?: string;
}): Promise<SignUpResponse> {
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      await createAuditLog({
        event_type: 'signup',
        success: false,
        error_message: authError.message,
        user_id: null
      });
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      await createAuditLog({
        event_type: 'signup',
        success: false,
        error_message: 'Failed to create auth user',
        user_id: null
      });
      return { success: false, error: 'Failed to create auth user' };
    }

    // 2. Create user in users table
    const baseUserData: Partial<AppUser> & { password_hash: string } = {
      id: authData.user.id,
      email: userData.email,
      password_hash: '', // Dummy value to satisfy NOT NULL constraint
      role: userData.role,
      full_name: userData.full_name ?? null,
      phone_number: userData.phone_number ?? null,
      street_address: userData.street_address ?? null,
      city: userData.city ?? null,
      date_of_birth: userData.date_of_birth ?? null,
      verified: false, // Default to false, requires email confirmation
      profile_image_url: null,
      national_id_or_passport: null,
      tin_number: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add role-specific fields (host)
    if (userData.role === 'host') {
      baseUserData.national_id_or_passport = userData.national_id_or_passport ?? null;
      baseUserData.tin_number = userData.tin_number ?? null;
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert(baseUserData);

    if (insertError) {
      await createAuditLog({
        event_type: 'signup',
        success: false,
        error_message: insertError.message,
        user_id: authData.user.id
      });
      return { success: false, error: insertError.message };
    }

    // 3. If user is a host, create approval request
    if (userData.role === 'host') {
      const { error: approvalError } = await supabaseAdmin
        .from('host_approval_requests')
        .insert({
          user_id: authData.user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (approvalError) {
        console.warn('Failed to create host approval request:', approvalError);
        // Don't fail the signup for this, just log it
      }
    }

    // 4. Send verification email
    const verificationToken = generateToken();
    const userFullName = userData.full_name || 'User';
    
    const emailResult = await sendVerificationEmail(
      userData.email,
      userFullName,
      verificationToken,
      authData.user.id  // Pass the user ID directly
    );
    
    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error);
      // Don't fail the signup for this, just log it
    }

    // 5. Create audit log
    await createAuditLog({
      event_type: 'signup',
      success: true,
      user_id: authData.user.id
    });

    return { success: true, data: { userId: authData.user.id } };
  } catch (error) {
    console.error('Sign up error:', error);
    await createAuditLog({
      event_type: 'signup',
      success: false,
      error_message: (error as Error).message,
      user_id: null
    });
    return { success: false, error: (error as Error).message };
  }
}

// Sign in user
export async function signInUser(email: string, password: string): Promise<SignInResponse> {
  try {
    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await createAuditLog({
        event_type: 'login',
        success: false,
        error_message: error.message,
        user_id: null
      });
      return { success: false, error: error.message };
    }

    if (!data.user) {
      await createAuditLog({
        event_type: 'login',
        success: false,
        error_message: 'No user returned from auth',
        user_id: null
      });
      return { success: false, error: 'Authentication failed' };
    }

    // 2. Fetch user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id);

    if (userError) {
      await createAuditLog({
        event_type: 'login',
        success: false,
        error_message: userError.message,
        user_id: data.user.id
      });
      return { success: false, error: userError.message };
    }

    // Check if user exists in our database
    if (!userData || userData.length === 0) {
      await createAuditLog({
        event_type: 'login',
        success: false,
        error_message: 'User not found in database',
        user_id: data.user.id
      });
      return { success: false, error: 'User account not found. Please contact support.' };
    }

    // 3. Create audit log
    await createAuditLog({
      event_type: 'login',
      success: true,
      user_id: data.user.id
    });

    return { success: true, data: { user: userData[0] } };
  } catch (error) {
    console.error('Sign in error:', error);
    await createAuditLog({
      event_type: 'login',
      success: false,
      error_message: (error as Error).message,
      user_id: null
    });
    return { success: false, error: (error as Error).message };
  }
}

// Sign out user
export async function signOutUser(): Promise<SignOutResponse> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Get current user
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Fetch user details from users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id);

    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }

    // Check if user exists
    if (!userData || userData.length === 0) {
      console.error('User not found in database');
      return null;
    }

    return userData[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Refresh user data
export async function refreshUser(): Promise<AppUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Fetch user details from users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id);

    if (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }

    // Check if user exists
    if (!userData || userData.length === 0) {
      console.error('User not found in database');
      return null;
    }

    return userData[0];
  } catch (error) {
    console.error('Error refreshing user:', error);
    return null;
  }
}

// Update user
export async function updateUser(id: string, userData: Partial<AppUser>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Update user password
export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, verify the current password by attempting to sign in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { success: false, error: 'No active session found' };
    }

    // Update the password using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      await createAuditLog({
        event_type: 'password_update',
        success: false,
        error_message: error.message,
        user_id: session.user.id
      });
      return { success: false, error: error.message };
    }

    // Create audit log for successful password update
    await createAuditLog({
      event_type: 'password_update',
      success: true,
      user_id: session.user.id
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    await createAuditLog({
      event_type: 'password_update',
      success: false,
      error_message: (error as Error).message,
      user_id: null
    });
    return { success: false, error: (error as Error).message };
  }
}