import { supabaseAdmin } from '../lib/supabaseClient';

async function testSupabaseAdmin() {
  try {
    console.log('Testing Supabase admin client configuration...');
    
    // Check if supabaseAdmin is defined
    if (!supabaseAdmin) {
      console.error('Supabase admin client is not defined');
      return;
    }
    
    console.log('Supabase admin client is configured');
    
    // Try a simple query to test the connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error testing Supabase connection:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if it's an authentication error
      if (error.code === '42501') {
        console.error('Insufficient privileges - this might be because SERVICE_ROLE_KEY is not set');
      }
      return;
    }
    
    console.log('Successfully connected to Supabase with admin privileges');
    console.log('Test query result:', data);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSupabaseAdmin();