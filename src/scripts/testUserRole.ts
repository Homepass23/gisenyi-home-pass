import { supabaseAdmin } from '../lib/supabaseClient'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testUserRole() {
  try {
    console.log('Testing user role consistency...')
    
    // Fetch a few users to check their roles
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .limit(10)
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    console.log('Users and their roles:')
    users?.forEach(user => {
      console.log(`- ${user.email}: ${user.role}`)
    })
    
    // Check if we have any customers
    const customers = users?.filter(user => user.role === 'customer')
    console.log(`Found ${customers?.length || 0} customers`)
    
    // Check if we have any hosts
    const hosts = users?.filter(user => user.role === 'host')
    console.log(`Found ${hosts?.length || 0} hosts`)
    
    // Check if we have any admins
    const admins = users?.filter(user => user.role === 'admin')
    console.log(`Found ${admins?.length || 0} admins`)
    
    console.log('Role test completed successfully!')
  } catch (error) {
    console.error('Test failed with error:', error)
  }
}

testUserRole()