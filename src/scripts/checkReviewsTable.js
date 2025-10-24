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

async function checkReviewsTable() {
  try {
    console.log('Checking reviews table...');
    
    // Check reviews count
    const { count: reviewsCount, error: reviewsCountError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });
    
    if (reviewsCountError) {
      console.error('Error counting reviews:', reviewsCountError);
      process.exit(1);
    }
    
    console.log(`Reviews: ${reviewsCount} records`);
    
    // Show some sample reviews if they exist
    if (reviewsCount && reviewsCount > 0) {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .limit(5);
      
      if (!reviewsError && reviewsData) {
        console.log('Sample Reviews:');
        reviewsData.forEach(review => {
          console.log(`  - Accommodation ID: ${review.accommodation_id}`);
          console.log(`    Rating: ${review.rating}`);
          console.log(`    Comment: ${review.comment}`);
          console.log(`    Reviewer: ${review.reviewer_name}`);
        });
      }
    } else {
      console.log('No reviews found in the database.');
    }
    
    // Get accommodations to see what we can review
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('id, title');
    
    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      process.exit(1);
    }
    
    console.log('\nAvailable Accommodations for Review:');
    if (accommodationsData) {
      accommodationsData.forEach(acc => {
        console.log(`  - ${acc.title} (ID: ${acc.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking reviews table:', error);
    process.exit(1);
  }
}

// Run the function
checkReviewsTable();