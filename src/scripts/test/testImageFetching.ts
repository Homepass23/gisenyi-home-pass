import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { fetchTopRatedAccommodations } from '../../lib/queryHelpers'

async function testImageFetching() {
  console.log('Testing image fetching with new schema...')
  
  try {
    console.log('Fetching top rated accommodations...')
    const accommodations = await fetchTopRatedAccommodations(5)
    console.log('Found', accommodations.length, 'accommodations')
    console.log('Accommodations data:')
    accommodations.forEach((acc, index) => {
      console.log(`${index + 1}. ${acc.title} - Rating: ${acc.rating} - Location: ${acc.location}`)
      console.log(`   Type: ${acc.type} - Price: ${acc.price_per_night}`)
      console.log(`   Images: ${acc.image_urls.length} images`)
      acc.image_urls.forEach((url, imgIndex) => {
        console.log(`     Image ${imgIndex + 1}: ${url}`)
      })
    })
  } catch (error) {
    console.error('Error fetching accommodations:', error)
  }
}

testImageFetching()