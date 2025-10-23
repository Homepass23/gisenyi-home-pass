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

async function verifyEmptyDatabase() {
  try {
    console.log('Verifying database is empty...');
    
    // Check each table for records
    const tables = [
      'reviews',
      'bookings',
      'accommodation_rooms',
      'accommodation_gallery',
      'email_logs',
      'accommodations',
      'users'
    ];
    
    let totalRecords = 0;
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
        process.exit(1);
      }
      
      console.log(`${table}: ${count} records`);
      totalRecords += count || 0;
    }
    
    // Check if only the default admin user exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) {
      console.error('Error fetching users:', usersError);
      process.exit(1);
    }
    
    if (totalRecords === 1 && users && users.length === 1 && users[0].email === 'admin@gisenyahomepass.com') {
      console.log('✅ Database verification successful! Only the default admin user exists.');
    } else {
      console.log('❌ Database verification failed!');
      console.log('Expected 1 record (admin user), but found', totalRecords, 'records');
      if (users && users.length > 0) {
        console.log('Users found:', users.map(u => u.email));
      }
    }
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  }
}

// Run the function
verifyEmptyDatabase();