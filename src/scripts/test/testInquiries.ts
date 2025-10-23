import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testInquiries() {
  console.log('Testing customer inquiries functionality...')

  try {
    // Test inserting a new inquiry
    const newInquiry = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      subject: 'Test Inquiry',
      message: 'This is a test inquiry to verify the functionality.',
      status: 'new'
    }

    const { data, error } = await supabase
      .from('customer_inquiries')
      .insert([newInquiry])
      .select()

    if (error) {
      console.error('Error inserting test inquiry:', error)
      process.exit(1)
    }

    console.log('Successfully inserted test inquiry:', data?.[0])

    // Test fetching inquiries
    const { data: inquiries, error: fetchError } = await supabase
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('Error fetching inquiries:', fetchError)
      process.exit(1)
    }

    console.log('Successfully fetched inquiries:')
    console.log(inquiries)

    // Test updating an inquiry
    if (data && data[0]) {
      const { error: updateError } = await supabase
        .from('customer_inquiries')
        .update({ 
          status: 'responded',
          response: 'Thank you for your inquiry. We will get back to you soon.',
          responded_at: new Date().toISOString()
        })
        .eq('id', data[0].id)

      if (updateError) {
        console.error('Error updating inquiry:', updateError)
        process.exit(1)
      }

      console.log('Successfully updated inquiry status to responded')
    }

    console.log('All tests passed!')
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

// Run the function
testInquiries()