import dotenv from 'dotenv';
import path from 'path';
import { fetchAccommodationById } from '../../lib/queryHelpers';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFetchAccommodation() {
  try {
    console.log('Testing fetchAccommodationById function...');
    
    // Test with the Lake View Villa ID
    const accommodationId = 'fefb2a7b-c104-4965-ad6a-13ee33f0bc21';
    console.log(`Fetching accommodation with ID: ${accommodationId}`);
    
    const accommodation = await fetchAccommodationById(accommodationId);
    
    console.log('Accommodation fetched successfully!');
    console.log(`Title: ${accommodation.title}`);
    console.log(`Description: ${accommodation.description.substring(0, 50)}...`);
    console.log(`Reviews count: ${accommodation.reviews ? accommodation.reviews.length : 0}`);
    
    if (accommodation.reviews && accommodation.reviews.length > 0) {
      console.log('First review:');
      console.log(`  Rating: ${accommodation.reviews[0].rating}`);
      console.log(`  Comment: ${accommodation.reviews[0].comment.substring(0, 50)}...`);
      if (accommodation.reviews[0].user) {
        console.log(`  Reviewer: ${accommodation.reviews[0].user.name}`);
      }
    } else {
      console.log('No reviews found in the accommodation data');
    }
    
  } catch (error) {
    console.error('Error testing fetchAccommodationById:', error);
    process.exit(1);
  }
}

testFetchAccommodation();