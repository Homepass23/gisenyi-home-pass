import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fetchAccommodationById } from '../../lib/queryHelpers';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAccommodationWithReviews() {
  try {
    console.log('Testing accommodation with reviews...');
    
    // Get the first accommodation ID from the database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error fetching accommodations:', error);
      process.exit(1);
    }
    
    if (!accommodations || accommodations.length === 0) {
      console.log('No accommodations found in database');
      process.exit(1);
    }
    
    const accommodationId = accommodations[0].id;
    console.log(`Testing with accommodation ID: ${accommodationId}`);
    
    // Fetch accommodation with reviews
    const accommodation = await fetchAccommodationById(accommodationId);
    
    console.log('Accommodation data:');
    console.log(`  Title: ${accommodation.title}`);
    console.log(`  Reviews count: ${accommodation.reviews ? accommodation.reviews.length : 0}`);
    
    if (accommodation.reviews && accommodation.reviews.length > 0) {
      console.log('  Sample reviews:');
      accommodation.reviews.slice(0, 3).forEach((review, index) => {
        console.log(`    ${index + 1}. Rating: ${review.rating}, Comment: ${review.comment.substring(0, 50)}...`);
        if (review.user) {
          console.log(`       Reviewer: ${review.user.name}`);
        }
      });
    } else {
      console.log('  No reviews found for this accommodation');
    }
    
  } catch (error) {
    console.error('Error testing accommodation with reviews:', error);
    process.exit(1);
  }
}

// Run the test
testAccommodationWithReviews();