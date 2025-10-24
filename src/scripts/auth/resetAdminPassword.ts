'use client'

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client with service role key (admin privileges)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // First, let's check if the admin user exists
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', 'admin@gisenyahomepass.com')
      .single();
    
    if (fetchError) {
      console.error('Error fetching admin user:', fetchError);
      process.exit(1);
    }
    
    if (!userData) {
      console.error('Admin user not found in database');
      process.exit(1);
    }
    
    console.log(`Found admin user with ID: ${userData.id}`);
    
    // Now, let's update the admin user's password using Supabase Auth admin API
    // This will properly register the password with Supabase Auth
    const { data: authData, error } = await supabaseAdmin.auth.admin.updateUserById(
      userData.id,
      { 
        password: 'admin123', // Set a new password
        email_confirm: true   // Confirm the email
      }
    );
    
    if (error) {
      console.error('Error updating admin password:', error);
      process.exit(1);
    }
    
    console.log('✅ Admin password successfully reset!');
    console.log('You can now log in with:');
    console.log('Email: admin@gisenyahomepass.com');
    console.log('Password: admin123');
    console.log('Auth update response:', authData);
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

// Run the function
resetAdminPassword();