import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function repopulateAndFixAuth() {
  try {
    console.log('Repopulating database and fixing authentication...');
    
    // First, empty the database
    console.log('Emptying existing data...');
    const tables = [
      'reviews',
      'bookings',
      'accommodation_rooms',
      'accommodation_gallery',
      'email_logs',
      'accommodations',
      'users'
    ];
    
    for (const table of tables) {
      console.log(`Deleting all records from table: ${table}`);
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        console.error(`Error deleting records from table ${table}:`, error);
        process.exit(1);
      }
    }
    
    // Create admin user through proper signup process
    console.log('Creating admin user with proper authentication...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@gisenyahomepass.com',
      password: 'admin123'
    });
    
    if (signUpError) {
      console.error('Error signing up admin user:', signUpError);
      process.exit(1);
    }
    
    console.log('Admin user signed up successfully');
    
    // Wait for auth to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update admin user in database with correct role
    if (authData.user) {
      console.log(`Setting admin user role for user ID: ${authData.user.id}`);
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          role: 'admin',
          verified: true
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating admin user role:', updateError);
        process.exit(1);
      }
      
      console.log('Admin user role updated successfully');
    }
    
    // Insert other users (without passwords as they'll be set through signup if needed)
    console.log('Inserting other users...');
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .insert([
        // Customers
        {
          email: 'john.doe@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: true,
          full_name: 'John Doe',
          phone_number: '+250781234567',
          street_address: '123 Main Street',
          city: 'Kigali',
          profile_image_url: null,
          date_of_birth: '1990-04-12',
          national_id_or_passport: null,
          tin_number: null
        },
        {
          email: 'jane.smith@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: false,
          full_name: 'Jane Smith',
          phone_number: '+250789876543',
          street_address: '45 Market Road',
          city: 'Rubavu',
          profile_image_url: '/images/me.jpg',
          date_of_birth: '1993-11-05',
          national_id_or_passport: null,
          tin_number: null
        },
        {
          email: 'alex.mwiza@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: true,
          full_name: 'Alex Mwiza',
          phone_number: '+250780112233',
          street_address: '10 Nyamirambo Ave',
          city: 'Kigali',
          profile_image_url: null,
          date_of_birth: '1998-07-21',
          national_id_or_passport: null,
          tin_number: null
        },
        // Owners
        {
          email: 'patrick.owner@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'host',
          verified: true,
          full_name: 'Patrick Nshimiyimana',
          phone_number: '+250782345678',
          street_address: '12 Avenue du Lac',
          city: 'Rubavu',
          profile_image_url: null,
          date_of_birth: '1988-09-10',
          national_id_or_passport: '1199880044556677',
          tin_number: 'TIN123456'
        },
        {
          email: 'maria.habimana@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'host',
          verified: true,
          full_name: 'Maria Habimana',
          phone_number: '+250784567890',
          street_address: '22 KN Street',
          city: 'Kigali',
          profile_image_url: '/images/me.jpg',
          date_of_birth: '1992-03-16',
          national_id_or_passport: 'PA00998877',
          tin_number: 'TIN998877'
        }
      ])
      .select('id, email, role');
    
    if (usersError) {
      console.error('Error inserting users:', usersError);
      process.exit(1);
    }
    
    console.log('Users inserted:', usersData);
    
    console.log('✅ Database repopulated and authentication fixed!');
    console.log('Admin user credentials:');
    console.log('Email: admin@gisenyahomepass.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error repopulating database and fixing authentication:', error);
    process.exit(1);
  }
}

// Run the function
repopulateAndFixAuth();