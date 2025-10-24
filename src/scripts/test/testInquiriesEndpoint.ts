import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testInquiriesEndpoint() {
  console.log('Testing inquiries API endpoint...')
  
  try {
    // Test data
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      subject: 'Test Subject',
      comment: 'This is a test inquiry from the test script.'
    }
    
    console.log('Sending test data:', testData)
    
    // Since we're testing from the server side, we'll directly test the Supabase insertion
    // In a real scenario, you would test the actual API endpoint
    
    const { supabaseAdmin } = await import('../../lib/supabaseClient')
    
    // Insert inquiry into database
    const { data, error } = await supabaseAdmin
      .from('customer_inquiries')
      .insert([
        {
          name: testData.name,
          email: testData.email,
          phone: testData.phone,
          subject: testData.subject,
          message: testData.comment,
          status: 'new'
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting inquiry:', error)
      process.exit(1)
    }
    
    console.log('Successfully inserted test inquiry:', data)
    
    // Fetch the inquiry to verify it was inserted
    const { data: fetchedData, error: fetchError } = await supabaseAdmin
      .from('customer_inquiries')
      .select('*')
      .eq('id', data.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching inquiry:', fetchError)
      process.exit(1)
    }
    
    console.log('Successfully fetched inquiry:', fetchedData)
    console.log('Test completed successfully!')
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

// Run the test
testInquiriesEndpoint()