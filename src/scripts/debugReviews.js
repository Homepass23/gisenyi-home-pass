import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Debug script started');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY || '';

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Service Role Key:', supabaseServiceRoleKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugReviews() {
  try {
    console.log('Fetching accommodations...');
    
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
    
    // Fetch reviews for this accommodation
    console.log('Fetching reviews...');
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
      console.log('First review:');
      console.log(`  ID: ${reviews[0].id}`);
      console.log(`  Rating: ${reviews[0].rating}`);
      console.log(`  Comment: ${reviews[0].comment}`);
      console.log(`  Reviewer name: ${reviews[0].reviewer_name}`);
      if (reviews[0].user) {
        console.log(`  User full name: ${reviews[0].user.full_name}`);
      }
    }
    
  } catch (error) {
    console.error('Error in debugReviews:', error);
    process.exit(1);
  }
}

debugReviews();