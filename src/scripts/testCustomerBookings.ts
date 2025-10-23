import { supabase, supabaseAdmin } from '../lib/supabaseClient'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testCustomerBookings() {
  try {
    console.log('Testing customer bookings query...')
    
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...')
    const { error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.error('Supabase connection error:', connectionError)
      return
    }
    console.log('Supabase connection successful')
    
    // Test 2: Check if bookings table exists and has data
    console.log('Checking bookings table...')
    const { data: bookingsData, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_id')
      .limit(5)
    
    if (bookingsError) {
      console.error('Bookings table query error:', bookingsError)
      return
    }
    console.log('Bookings table query successful:', bookingsData?.length || 0, 'records found')
    
    // Test 3: Check if we can query with a specific customer ID (if we have one)
    if (bookingsData && bookingsData.length > 0 && bookingsData[0].customer_id) {
      console.log('Testing specific customer query...')
      const customerId = bookingsData[0].customer_id
      const { data: customerBookings, error: customerError } = await supabase
        .from('bookings')
        .select(`
          *,
          accommodation:accommodations(title, image_urls)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      
      if (customerError) {
        console.error('Customer bookings query error:', customerError)
        return
      }
      console.log('Customer bookings query successful:', customerBookings?.length || 0, 'records found')
    }
    
    console.log('All tests completed successfully!')
  } catch (error) {
    console.error('Test failed with error:', error)
  }
}

testCustomerBookings()