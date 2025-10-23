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

async function linkUsersWithAuth() {
  try {
    console.log('Linking users with Supabase Auth...');
    
    // Get all users from the database
    const { data: dbUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role');
    
    if (fetchError) {
      console.error('Error fetching users from database:', fetchError);
      process.exit(1);
    }
    
    console.log(`Found ${dbUsers.length} users in database:`);
    dbUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    // For each user, we need to ensure they exist in Supabase Auth
    // Since we can't directly create users in Auth with specific IDs,
    // we'll provide instructions for manual setup
    
    console.log('\n--- USER LINKING INSTRUCTIONS ---');
    console.log('To properly link these users with Supabase Auth:');
    console.log('');
    
    for (const user of dbUsers) {
      console.log(`User: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Action needed: Create this user in Supabase Auth dashboard`);
      console.log(`    - Email: ${user.email}`);
      console.log(`    - Password: ${user.role}123 (or any secure password)`);
      console.log('');
    }
    
    console.log('--- HOW THE LINKING WORKS ---');
    console.log('1. When a user signs up through your app, Supabase Auth creates an auth user');
    console.log('2. Your signup function then creates a record in the users table with the same ID');
    console.log('3. The AuthContext in your app links the two by matching the auth user ID with the database user ID');
    console.log('');
    console.log('--- FOR YOUR CURRENT SITUATION ---');
    console.log('Since your users already exist in the database but not in Auth:');
    console.log('1. You need to manually create each user in Supabase Auth');
    console.log('2. Make sure the email addresses match exactly');
    console.log('3. The IDs don\'t need to match (Supabase Auth will generate new IDs)');
    console.log('4. Your application will still work because it matches by email, not ID');
    console.log('');
    console.log('--- ADMIN USER SPECIFICALLY ---');
    console.log('For the admin user:');
    console.log('- Email: admin@gisenyahomepass.com');
    console.log('- Create in Supabase Auth dashboard with any password');
    console.log('- After login, the app will recognize the role from database');
    
  } catch (error) {
    console.error('Error linking users with auth:', error);
    process.exit(1);
  }
}

// Run the function
linkUsersWithAuth();