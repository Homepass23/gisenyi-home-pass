import { supabaseAdmin } from '../lib/supabaseClient';

async function testInquiriesTable() {
  try {
    console.log('Testing customer_inquiries table access...');
    
    // Try to fetch from the table
    const { data, error } = await supabaseAdmin
      .from('customer_inquiries')
      .select('id, name, email, subject')
      .limit(1);
    
    if (error) {
      console.error('Error accessing customer_inquiries table:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    
    console.log('Successfully accessed customer_inquiries table');
    console.log('Sample data:', data);
    
    // Try to insert a test record
    const testInquiry = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Inquiry',
      message: 'This is a test inquiry to verify table access',
      status: 'new'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('customer_inquiries')
      .insert(testInquiry)
      .select();
    
    if (insertError) {
      console.error('Error inserting test record:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return;
    }
    
    console.log('Successfully inserted test record:', insertData);
    
    // Clean up - delete the test record
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabaseAdmin
        .from('customer_inquiries')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('Error deleting test record:', deleteError);
      } else {
        console.log('Successfully cleaned up test record');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testInquiriesTable();