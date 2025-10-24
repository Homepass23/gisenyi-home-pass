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

// Sample inquiries data
const sampleInquiries = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+250781234567',
    subject: 'Room Availability Inquiry',
    message: 'I would like to know if you have any rooms available for the dates June 15-20, 2024. I am looking for a room that can accommodate 2 people.',
    status: 'new'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+250787654321',
    subject: 'House Booking Question',
    message: 'Do you offer airport pickup services for guests staying at your houses? Also, what are your check-in and check-out times?',
    status: 'responded',
    response: 'Thank you for your inquiry, Sarah. Yes, we do offer airport pickup services for an additional fee of 15,000 RWF. Our standard check-in time is 2:00 PM and check-out is 11:00 AM. Please let us know if you would like to book this service.',
    responded_at: new Date().toISOString()
  },
  {
    name: 'Michael Brown',
    email: 'm.brown@email.com',
    phone: null,
    subject: 'Pricing Information',
    message: 'Could you please provide detailed pricing information for your luxury house rental? I am planning a family vacation for 6 people in July.',
    status: 'closed'
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    phone: '+250785556677',
    subject: 'Corporate Partnership',
    message: 'I represent a travel company interested in establishing a corporate partnership with your accommodation service. We would like to discuss potential collaboration opportunities.',
    status: 'new'
  },
  {
    name: 'David Kim',
    email: 'david.kim@traveler.com',
    phone: null,
    subject: 'Special Requests',
    message: 'I have a food allergy (gluten intolerance). Can you accommodate special dietary requirements during my stay from August 5-12?',
    status: 'responded',
    response: 'Dear David, thank you for informing us about your dietary requirements. We can certainly accommodate gluten-free meals during your stay. Please inform us of any other specific needs when you check in.',
    responded_at: new Date().toISOString()
  }
]

async function populateInquiriesTable() {
  console.log('Populating customer inquiries table...')

  try {
    // Insert sample inquiries
    const { error } = await supabase
      .from('customer_inquiries')
      .insert(sampleInquiries)

    if (error) {
      console.error('Error inserting sample inquiries:', error)
      process.exit(1)
    }

    console.log('Successfully populated customer inquiries table with sample data')
    console.log(`Inserted ${sampleInquiries.length} sample inquiries`)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

// Run the function
populateInquiriesTable()