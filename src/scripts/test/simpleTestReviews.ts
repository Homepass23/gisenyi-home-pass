import dotenv from 'dotenv';
import path from 'path';
import { fetchAccommodationById } from '../../lib/queryHelpers';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function simpleTest() {
  console.log('Simple test to check if reviews are being fetched...');
  
  try {
    // Try to fetch an accommodation by a known ID
    // Using the Lake View Villa ID from our previous tests
    const accommodation = await fetchAccommodationById('fefb2a7b-c104-4965-ad6a-13ee33f0bc21');
    
    console.log('Accommodation fetched successfully!');
    console.log(`Title: ${accommodation.title}`);
    console.log(`Reviews count: ${accommodation.reviews?.length || 0}`);
    
    if (accommodation.reviews && accommodation.reviews.length > 0) {
      console.log('First review:');
      console.log(`  Rating: ${accommodation.reviews[0].rating}`);
      console.log(`  Comment: ${accommodation.reviews[0].comment}`);
      if (accommodation.reviews[0].user) {
        console.log(`  Reviewer: ${accommodation.reviews[0].user.name}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleTest();