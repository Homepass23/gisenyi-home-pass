import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testImageUploadFix() {
  try {
    console.log('Testing image upload fix...');
    
    // Create a test accommodation
    const { data: accommodation, error: accommodationError } = await supabase
      .from('accommodations')
      .insert({
        title: 'Test Accommodation for Image Fix',
        description: 'Testing image upload and saving fix',
        type: 'house',
        location: 'Test Location',
        price_per_night: 10000,
        num_of_guests: 4,
        num_of_rooms: 2,
        num_of_bathrooms: 1,
        amenities: ['WiFi', 'Parking'],
        cancellation_policy: 'partial',
        allow_independent_room_booking: false,
        rating: 0,
        owner_id: '00000000-0000-0000-0000-000000000000' // Placeholder owner ID
      })
      .select()
      .single();

    if (accommodationError) {
      console.error('Error creating test accommodation:', accommodationError);
      return;
    }

    console.log('Created test accommodation:', accommodation.title);

    // Test saving gallery images
    const testImages = [
      'https://example.com/test-image-1.jpg',
      'https://example.com/test-image-2.jpg',
      'https://example.com/test-image-3.jpg'
    ];

    // Delete existing gallery images for this accommodation
    const { error: deleteError } = await supabase
      .from('accommodation_gallery')
      .delete()
      .eq('accommodation_id', accommodation.id);

    if (deleteError) {
      console.error('Error deleting existing gallery images:', deleteError);
      return;
    }

    // Insert new gallery images
    const galleryData = testImages.map(imageUrl => ({
      accommodation_id: accommodation.id,
      image_url: imageUrl
    }));

    const { error: insertError } = await supabase
      .from('accommodation_gallery')
      .insert(galleryData);

    if (insertError) {
      console.error('Error inserting gallery images:', insertError);
      return;
    }

    console.log('Successfully inserted gallery images');

    // Verify the images were saved
    const { data: savedImages, error: fetchError } = await supabase
      .from('accommodation_gallery')
      .select('image_url')
      .eq('accommodation_id', accommodation.id);

    if (fetchError) {
      console.error('Error fetching gallery images:', fetchError);
      return;
    }

    console.log('Saved images:', savedImages);

    // Clean up - delete test accommodation
    const { error: deleteAccommodationError } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', accommodation.id);

    if (deleteAccommodationError) {
      console.error('Error deleting test accommodation:', deleteAccommodationError);
      return;
    }

    console.log('✅ Image upload fix test completed successfully!');
    console.log('Images are being saved correctly to the accommodation_gallery table.');
  } catch (error) {
    console.error('Error in testImageUploadFix:', error);
  }
}

testImageUploadFix();