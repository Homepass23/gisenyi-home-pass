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

async function verifyRoomImages() {
  try {
    console.log('Verifying room images in accommodation rooms...');
    
    // Get all accommodation rooms with their image galleries
    const { data: rooms, error: roomsError } = await supabase
      .from('accommodation_rooms')
      .select('id, room_name, image_gallery');
    
    if (roomsError) {
      console.error('Error fetching accommodation rooms:', roomsError);
      process.exit(1);
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('No accommodation rooms found in the database.');
      process.exit(0);
    }
    
    console.log(`Found ${rooms.length} accommodation rooms:`);
    
    // Verify each room has the images
    const expectedImages = [
      '/images/room.jpg',
      '/images/room0.jpg',
      '/images/room0.1.jpg',
      '/images/room0.2.jpg'
    ];
    
    for (const room of rooms) {
      console.log(`\nRoom: ${room.room_name} (${room.id})`);
      
      if (!room.image_gallery) {
        console.log('  ❌ No image gallery found');
        continue;
      }
      
      if (room.image_gallery.length !== expectedImages.length) {
        console.log(`  ❌ Expected ${expectedImages.length} images, found ${room.image_gallery.length}`);
        console.log(`  Images:`, room.image_gallery);
        continue;
      }
      
      // Check if all expected images are present
      let allImagesPresent = true;
      for (const expectedImage of expectedImages) {
        if (!room.image_gallery.includes(expectedImage)) {
          console.log(`  ❌ Missing image: ${expectedImage}`);
          allImagesPresent = false;
        }
      }
      
      if (allImagesPresent) {
        console.log('  ✅ All images present');
      } else {
        console.log(`  Images:`, room.image_gallery);
      }
    }
    
    console.log('\nVerification complete.');
  } catch (error) {
    console.error('Error verifying room images:', error);
    process.exit(1);
  }
}

// Run the function
verifyRoomImages();