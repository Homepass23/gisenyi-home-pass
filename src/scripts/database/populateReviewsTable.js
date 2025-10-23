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

// Sample review data for each accommodation
const accommodationReviews = [
  {
    title: 'Lake View Villa',
    reviews: [
      {
        rating: 5,
        comment: 'Absolutely stunning villa with breathtaking views of Lake Kivu. The private dock was perfect for morning swims. Highly recommend!',
        reviewer_name: 'Sarah Johnson',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 4,
        comment: 'Beautiful location and well-maintained property. The staff was friendly and helpful. Only minor issue was the Wi-Fi connection.',
        reviewer_name: 'Michael Chen',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 5,
        comment: 'Perfect getaway spot. The villa is spacious and clean. The lake view from the master bedroom is incredible!',
        reviewer_name: 'Emma Williams',
        reviewer_image_url: '/images/me.jpg'
      }
    ]
  },
  {
    title: 'Rubavu Guesthouse',
    reviews: [
      {
        rating: 4,
        comment: 'Great value for money. The rooms are clean and comfortable. The garden area is lovely for relaxation.',
        reviewer_name: 'David Brown',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 3,
        comment: 'Decent accommodation but a bit noisy due to street traffic. Breakfast could be improved.',
        reviewer_name: 'Lisa Anderson',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 4,
        comment: 'Friendly hosts and clean rooms. The shared kitchen is well-equipped. Good location for exploring Rubavu.',
        reviewer_name: 'James Wilson',
        reviewer_image_url: '/images/me.jpg'
      }
    ]
  },
  {
    title: 'Downtown Apartment',
    reviews: [
      {
        rating: 4,
        comment: 'Modern and comfortable apartment in a great location. Close to restaurants and shops. The balcony has nice city views.',
        reviewer_name: 'Robert Taylor',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 5,
        comment: 'Excellent apartment with all amenities. The air conditioning worked perfectly and the neighborhood is safe.',
        reviewer_name: 'Jennifer Martinez',
        reviewer_image_url: '/images/me.jpg'
      }
    ]
  },
  {
    title: 'Garden Cottage',
    reviews: [
      {
        rating: 5,
        comment: 'Charming cottage surrounded by beautiful gardens. Peaceful and relaxing stay. The rooms are cozy and well-appointed.',
        reviewer_name: 'Patricia Garcia',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 4,
        comment: 'Lovely place with great hosts. The garden is well-maintained and the rooms are clean. Perfect for a quiet retreat.',
        reviewer_name: 'Thomas Rodriguez',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 5,
        comment: 'Wonderful experience! The cottage is exactly as described. The washing machine was a bonus. Highly recommended.',
        reviewer_name: 'Linda Martinez',
        reviewer_image_url: '/images/me.jpg'
      }
    ]
  },
  {
    title: 'City Studio',
    reviews: [
      {
        rating: 3,
        comment: 'Good for a short stay. The studio is compact but has all necessary amenities. A bit small for extended stays.',
        reviewer_name: 'Christopher Lee',
        reviewer_image_url: '/images/me.jpg'
      },
      {
        rating: 4,
        comment: 'Perfect for solo travelers. Clean, modern, and conveniently located. The air conditioning is a must in the summer heat.',
        reviewer_name: 'Amanda Clark',
        reviewer_image_url: '/images/me.jpg'
      }
    ]
  }
];

async function populateReviewsTable() {
  try {
    console.log('Populating reviews table...');
    
    // Get all accommodations
    const { data: accommodations, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('id, title');
    
    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      process.exit(1);
    }
    
    console.log(`Found ${accommodations.length} accommodations`);
    
    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'customer');
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
      process.exit(1);
    }
    
    console.log(`Found ${customers.length} customers`);
    
    // Insert reviews for each accommodation
    let totalReviewsInserted = 0;
    
    for (const accommodation of accommodations) {
      const accommodationReviewData = accommodationReviews.find(acc => acc.title === accommodation.title);
      
      if (accommodationReviewData) {
        console.log(`Adding reviews for ${accommodation.title}...`);
        
        for (const review of accommodationReviewData.reviews) {
          // Randomly assign a customer to each review
          const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
          
          const { error: insertError } = await supabase
            .from('reviews')
            .insert({
              accommodation_id: accommodation.id,
              customer_id: randomCustomer.id,
              rating: review.rating,
              comment: review.comment,
              reviewer_name: review.reviewer_name,
              reviewer_image_url: review.reviewer_image_url
            });
          
          if (insertError) {
            console.error(`Error inserting review for ${accommodation.title}:`, insertError);
          } else {
            totalReviewsInserted++;
          }
        }
      } else {
        console.log(`No review data found for ${accommodation.title}`);
      }
    }
    
    console.log(`Successfully inserted ${totalReviewsInserted} reviews!`);
    
    // Verify the insertion
    const { count: reviewsCount, error: reviewsCountError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });
    
    if (reviewsCountError) {
      console.error('Error counting reviews:', reviewsCountError);
    } else {
      console.log(`Total reviews in database: ${reviewsCount}`);
    }
    
  } catch (error) {
    console.error('Error populating reviews table:', error);
    process.exit(1);
  }
}

// Run the function
populateReviewsTable();