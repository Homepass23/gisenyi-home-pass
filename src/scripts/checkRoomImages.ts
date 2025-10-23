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

async function checkRoomImages() {
  try {
    console.log('Checking room images in accommodation rooms...');
    
    // Get all accommodation rooms with their image galleries
    const { data: rooms, error: roomsError } = await supabase
      .from('accommodation_rooms')
      .select('id, room_name, image_gallery')
      .limit(3);
    
    if (roomsError) {
      console.error('Error fetching accommodation rooms:', roomsError);
      process.exit(1);
    }
    
    console.log('Sample of accommodation rooms:');
    for (const room of rooms || []) {
      console.log(`\nRoom: ${room.room_name}`);
      console.log(`ID: ${room.id}`);
      console.log(`Images:`, room.image_gallery);
    }
    
  } catch (error) {
    console.error('Error checking room images:', error);
    process.exit(1);
  }
}

// Run the function
checkRoomImages();