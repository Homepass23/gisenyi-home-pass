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

async function verifyPopulatedDatabase() {
  try {
    console.log('Verifying populated database...');
    
    // Check users count
    const { count: usersCount, error: usersCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersCountError) {
      console.error('Error counting users:', usersCountError);
      process.exit(1);
    }
    
    console.log(`Users: ${usersCount} records`);
    
    // Check accommodations count
    const { count: accommodationsCount, error: accommodationsCountError } = await supabase
      .from('accommodations')
      .select('*', { count: 'exact', head: true });
    
    if (accommodationsCountError) {
      console.error('Error counting accommodations:', accommodationsCountError);
      process.exit(1);
    }
    
    console.log(`Accommodations: ${accommodationsCount} records`);
    
    // Check accommodation rooms count
    const { count: roomsCount, error: roomsCountError } = await supabase
      .from('accommodation_rooms')
      .select('*', { count: 'exact', head: true });
    
    if (roomsCountError) {
      console.error('Error counting accommodation rooms:', roomsCountError);
      process.exit(1);
    }
    
    console.log(`Accommodation Rooms: ${roomsCount} records`);
    
    // Check accommodation gallery count
    const { count: galleryCount, error: galleryCountError } = await supabase
      .from('accommodation_gallery')
      .select('*', { count: 'exact', head: true });
    
    if (galleryCountError) {
      console.error('Error counting accommodation gallery:', galleryCountError);
      process.exit(1);
    }
    
    console.log(`Accommodation Gallery: ${galleryCount} records`);
    
    // Check bookings count
    const { count: bookingsCount, error: bookingsCountError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    if (bookingsCountError) {
      console.error('Error counting bookings:', bookingsCountError);
      process.exit(1);
    }
    
    console.log(`Bookings: ${bookingsCount} records`);
    
    // Check if we have the expected counts
    const expectedUsers = 6; // 1 admin + 3 customers + 2 owners
    const expectedAccommodations = 5;
    const expectedRooms = 6; // 3 rooms in Rubavu Guesthouse + 3 rooms in Garden Cottage
    const expectedGalleryItems = 11;
    const expectedBookings = 4; // 2 whole-house + 2 per-room
    
    if (usersCount === expectedUsers && 
        accommodationsCount === expectedAccommodations && 
        roomsCount === expectedRooms && 
        galleryCount === expectedGalleryItems && 
        bookingsCount === expectedBookings) {
      console.log('✅ Database verification successful! All data has been populated correctly.');
    } else {
      console.log('❌ Database verification failed!');
      console.log(`Expected: ${expectedUsers} users, ${expectedAccommodations} accommodations, ${expectedRooms} rooms, ${expectedGalleryItems} gallery items, ${expectedBookings} bookings`);
      console.log(`Found: ${usersCount} users, ${accommodationsCount} accommodations, ${roomsCount} rooms, ${galleryCount} gallery items, ${bookingsCount} bookings`);
    }
    
    // Show some sample data
    console.log('\n--- Sample Data ---');
    
    // Show users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('email, role, full_name')
      .limit(5);
    
    if (!usersError && usersData) {
      console.log('Sample Users:');
      usersData.forEach(user => {
        console.log(`  - ${user.full_name || 'N/A'} (${user.email}) - ${user.role}`);
      });
    }
    
    // Show accommodations
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('title, location, price_per_night')
      .limit(5);
    
    if (!accommodationsError && accommodationsData) {
      console.log('Sample Accommodations:');
      accommodationsData.forEach(acc => {
        console.log(`  - ${acc.title} in ${acc.location} - $${acc.price_per_night}/night`);
      });
    }
    
  } catch (error) {
    console.error('Error verifying populated database:', error);
    process.exit(1);
  }
}

// Run the function
verifyPopulatedDatabase();