import { supabaseAdmin } from '../../lib/supabaseClient';

async function testUsers() {
  try {
    console.log('Testing database connection and users table...');
    
    // Test connection by fetching users
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${data.length} users:`);
    data.forEach((user) => {
      console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    // Test fetching a specific user (this might cause the single() error)
    if (data.length > 0) {
      console.log('\nTesting single user fetch...');
      const { data: singleUser, error: singleError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data[0].id)
        .single();
      
      if (singleError) {
        console.error('Error fetching single user:', singleError);
      } else {
        console.log('Successfully fetched single user:', singleUser.email);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testUsers();