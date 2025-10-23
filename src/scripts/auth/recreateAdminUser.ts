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

async function recreateAdminUser() {
  try {
    console.log('Recreating admin user...');
    
    // First, let's check if the admin user exists
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', 'admin@gisenyahomepass.com')
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error fetching admin user:', fetchError);
      process.exit(1);
    }
    
    // If user exists, delete it
    if (userData) {
      console.log(`Found existing admin user with ID: ${userData.id}`);
      console.log('Deleting existing admin user...');
      
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userData.id);
      
      if (deleteError) {
        console.error('Error deleting admin user:', deleteError);
        process.exit(1);
      }
      
      console.log('Existing admin user deleted successfully');
    }
    
    // Now create a new admin user through the proper signup process
    console.log('Creating new admin user with proper authentication...');
    
    // We need to use a regular client for signup (not admin client)
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@gisenyahomepass.com',
      password: 'admin123'
    });
    
    if (signUpError) {
      console.error('Error signing up admin user:', signUpError);
      process.exit(1);
    }
    
    console.log('Admin user signed up successfully');
    console.log('Auth data:', authData);
    
    // Wait a moment for the auth signup to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now update the user's role in the database to 'admin'
    if (authData.user) {
      console.log(`Setting user role to admin for user ID: ${authData.user.id}`);
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          role: 'admin',
          verified: true
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating user role:', updateError);
        process.exit(1);
      }
      
      console.log('✅ Admin user successfully recreated with proper authentication!');
      console.log('You can now log in with:');
      console.log('Email: admin@gisenyahomepass.com');
      console.log('Password: admin123');
    } else {
      console.error('No user data returned from signup');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error recreating admin user:', error);
    process.exit(1);
  }
}

// Run the function
recreateAdminUser();