import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function emptyDatabase() {
  try {
    console.log('Emptying database...');
    
    // Truncate tables in correct order to avoid foreign key constraint issues
    const tables = [
      'reviews',
      'bookings',
      'accommodation_rooms',
      'accommodation_gallery',
      'email_logs',
      'accommodations',
      'users'
    ];
    
    // Truncate each table with cascade to remove all dependent records
    for (const table of tables) {
      console.log(`Truncating table: ${table}`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error(`Error truncating table ${table}:`, error);
        process.exit(1);
      }
    }
    
    // Re-insert the default admin account
    console.log('Re-inserting default admin account...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'admin@gisenyahomepass.com',
        password_hash: 'Gisenya',
        role: 'admin',
        verified: true
      });
      
    if (insertError) {
      console.error('Error inserting default admin account:', insertError);
      process.exit(1);
    }
    
    console.log('Database emptied successfully!');
  } catch (error) {
    console.error('Error emptying database:', error);
    process.exit(1);
  }
}

// Run the function
emptyDatabase();