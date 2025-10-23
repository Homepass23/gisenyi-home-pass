/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

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

async function addRoomImages() {
  try {
    console.log('Adding images to accommodation rooms...');
    
    // First, get all accommodation rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('accommodation_rooms')
      .select('*');
    
    if (roomsError) {
      console.error('Error fetching accommodation rooms:', roomsError);
      process.exit(1);
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('No accommodation rooms found in the database.');
      process.exit(0);
    }
    
    console.log(`Found ${rooms.length} accommodation rooms.`);
    
    // Images to add to each room (using actual images from public/images)
    const images = [
      '/images/Room.jpg',
      '/images/Room0.jpg',
      '/images/Room0.1.jpg',
      '/images/room0.2.jpg'
    ];
    
    // Update each room with the images
    for (const room of rooms) {
      console.log(`Updating room: ${room.room_name} (${room.id})`);
      
      // Create an array with the images
      const imageGallery = [...images];
      
      // Update the room with the image gallery
      const { error: updateError } = await supabase
        .from('accommodation_rooms')
        .update({ image_gallery: imageGallery })
        .eq('id', room.id);
      
      if (updateError) {
        console.error(`Error updating room ${room.room_name}:`, updateError);
      } else {
        console.log(`Successfully updated room ${room.room_name} with images:`, imageGallery);
      }
    }
    
    console.log('Finished updating all accommodation rooms with images.');
  } catch (error) {
    console.error('Error adding room images:', error);
    process.exit(1);
  }
}

// Run the function
addRoomImages();