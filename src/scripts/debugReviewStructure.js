import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugReviewStructure() {
  try {
    console.log('Debugging review structure...');
    
    // Get accommodations
    const { data: accommodations, error: accError } = await supabase
      .from('accommodations')
      .select('id, title')
      .limit(1);
    
    if (accError) {
      console.error('Error fetching accommodations:', accError);
      process.exit(1);
    }
    
    if (!accommodations || accommodations.length === 0) {
      console.log('No accommodations found');
      process.exit(1);
    }
    
    const accommodation = accommodations[0];
    console.log(`Testing with accommodation: ${accommodation.title} (ID: ${accommodation.id})`);
    
    // Fetch reviews using direct Supabase query
    console.log('Fetching reviews using direct Supabase query...');
    const { data: reviews, error: revError } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(full_name, profile_image_url)
      `)
      .eq('accommodation_id', accommodation.id);
    
    if (revError) {
      console.error('Error fetching reviews:', revError);
      process.exit(1);
    }
    
    console.log(`Found ${reviews.length} reviews`);
    
    if (reviews.length > 0) {
      console.log('First review structure:');
      console.log(JSON.stringify(reviews[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error in debugReviewStructure:', error);
    process.exit(1);
  }
}

debugReviewStructure();