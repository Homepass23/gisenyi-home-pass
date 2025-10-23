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

async function populateDatabase() {
  try {
    console.log('Populating database with sample data...');
    
    // First, empty the database
    console.log('Emptying existing data...');
    const tables = [
      'reviews',
      'bookings',
      'accommodation_rooms',
      'accommodation_gallery',
      'email_logs',
      'accommodations',
      'users'
    ];
    
    for (const table of tables) {
      console.log(`Deleting all records from table: ${table}`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        console.error(`Error deleting records from table ${table}:`, error);
        process.exit(1);
      }
    }
    
    // Insert users
    console.log('Inserting users...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .insert([
        // Admin
        {
          email: 'admin@gisenyahomepass.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'admin',
          verified: true,
          full_name: null,
          phone_number: null,
          street_address: null,
          city: null,
          profile_image_url: null,
          date_of_birth: null,
          national_id_or_passport: null,
          tin_number: null
        },
        // Customers
        {
          email: 'john.doe@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: true,
          full_name: 'John Doe',
          phone_number: '+250781234567',
          street_address: '123 Main Street',
          city: 'Kigali',
          profile_image_url: null,
          date_of_birth: new Date('1990-04-12'),
          national_id_or_passport: null,
          tin_number: null
        },
        {
          email: 'jane.smith@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: false,
          full_name: 'Jane Smith',
          phone_number: '+250789876543',
          street_address: '45 Market Road',
          city: 'Rubavu',
          profile_image_url: '/images/me.jpg',
          date_of_birth: new Date('1993-11-05'),
          national_id_or_passport: null,
          tin_number: null
        },
        {
          email: 'alex.mwiza@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'customer',
          verified: true,
          full_name: 'Alex Mwiza',
          phone_number: '+250780112233',
          street_address: '10 Nyamirambo Ave',
          city: 'Kigali',
          profile_image_url: null,
          date_of_birth: new Date('1998-07-21'),
          national_id_or_passport: null,
          tin_number: null
        },
        // Owners
        {
          email: 'patrick.owner@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'host',
          verified: true,
          full_name: 'Patrick Nshimiyimana',
          phone_number: '+250782345678',
          street_address: '12 Avenue du Lac',
          city: 'Rubavu',
          profile_image_url: null,
          date_of_birth: new Date('1988-09-10'),
          national_id_or_passport: '1199880044556677',
          tin_number: 'TIN123456'
        },
        {
          email: 'maria.habimana@example.com',
          password_hash: '', // Dummy value to satisfy NOT NULL constraint
          role: 'host',
          verified: true,
          full_name: 'Maria Habimana',
          phone_number: '+250784567890',
          street_address: '22 KN Street',
          city: 'Kigali',
          profile_image_url: '/images/me.jpg',
          date_of_birth: new Date('1992-03-16'),
          national_id_or_passport: 'PA00998877',
          tin_number: 'TIN998877'
        }
      ])
      .select('id, email, role');
    
    if (usersError) {
      console.error('Error inserting users:', usersError);
      process.exit(1);
    }
    
    console.log('Users inserted:', usersData);
    
    // Get owner IDs
    const owners = usersData?.filter(user => user.email === 'patrick.owner@example.com' || user.email === 'maria.habimana@example.com') || [];
    const patrickOwner = owners.find(owner => owner.email === 'patrick.owner@example.com');
    const mariaOwner = owners.find(owner => owner.email === 'maria.habimana@example.com');
    
    // Insert accommodations
    console.log('Inserting accommodations...');
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .insert([
        {
          owner_id: patrickOwner?.id,
          title: 'Lake View Villa',
          description: 'Beautiful villa overlooking Lake Kivu with private dock. Booked as a whole.',
          type: 'house',
          location: 'Rubavu',
          price_per_night: 180,
          num_of_guests: 8,
          num_of_rooms: 4,
          num_of_bathrooms: 3,
          amenities: ['WiFi', 'Kitchen', 'Parking', 'TV'],
          cancellation_policy: 'partial',
          allow_independent_room_booking: false,
          rating: 4.5
        },
        {
          owner_id: patrickOwner?.id,
          title: 'Rubavu Guesthouse',
          description: 'Spacious guesthouse with rooms available individually.',
          type: 'house',
          location: 'Rubavu',
          price_per_night: 300,
          num_of_guests: 10,
          num_of_rooms: 5,
          num_of_bathrooms: 5,
          amenities: ['WiFi', 'Shared Kitchen', 'Garden'],
          cancellation_policy: 'partial',
          allow_independent_room_booking: true,
          rating: 4.0
        },
        {
          owner_id: mariaOwner?.id,
          title: 'Downtown Apartment',
          description: 'Modern apartment near the Rubavu city center.',
          type: 'house',
          location: 'Rubavu',
          price_per_night: 90,
          num_of_guests: 4,
          num_of_rooms: 2,
          num_of_bathrooms: 1,
          amenities: ['WiFi', 'Air Conditioning', 'Balcony'],
          cancellation_policy: 'partial',
          allow_independent_room_booking: false,
          rating: 3.8
        },
        {
          owner_id: mariaOwner?.id,
          title: 'Garden Cottage',
          description: 'Quiet and cozy cottage with independent rentable rooms.',
          type: 'house',
          location: 'Kigali',
          price_per_night: 150,
          num_of_guests: 6,
          num_of_rooms: 3,
          num_of_bathrooms: 2,
          amenities: ['WiFi', 'Kitchen', 'Garden', 'Washing Machine'],
          cancellation_policy: 'partial',
          allow_independent_room_booking: true,
          rating: 4.2
        },
        {
          owner_id: mariaOwner?.id,
          title: 'City Studio',
          description: 'Compact studio ideal for solo travelers.',
          type: 'room',
          location: 'Kigali',
          price_per_night: 55,
          num_of_guests: 1,
          num_of_rooms: 1,
          num_of_bathrooms: 1,
          amenities: ['WiFi', 'Air Conditioning'],
          cancellation_policy: 'partial',
          allow_independent_room_booking: false,
          rating: 4.0
        }
      ])
      .select('id, title');
    
    if (accommodationsError) {
      console.error('Error inserting accommodations:', accommodationsError);
      process.exit(1);
    }
    
    console.log('Accommodations inserted:', accommodationsData);
    
    // Insert rooms for houses that allow independent bookings
    console.log('Inserting accommodation rooms...');
    
    // Get accommodations that allow independent room booking
    const roomsAccommodations = accommodationsData?.filter(acc => 
      acc.title === 'Rubavu Guesthouse' || acc.title === 'Garden Cottage'
    ) || [];
    
    const rubavuGuesthouse = roomsAccommodations.find(acc => acc.title === 'Rubavu Guesthouse');
    const gardenCottage = roomsAccommodations.find(acc => acc.title === 'Garden Cottage');
    
    const { error: roomsError } = await supabase
      .from('accommodation_rooms')
      .insert([
        // Rubavu Guesthouse rooms
        {
          accommodation_id: rubavuGuesthouse?.id,
          room_name: 'Room A',
          description: 'Lake-facing double room with balcony.',
          price_per_night: 70,
          num_of_guests: 2,
          num_of_beds: 1,
          private_bathroom: true
        },
        {
          accommodation_id: rubavuGuesthouse?.id,
          room_name: 'Room B',
          description: 'Garden-view room with twin beds.',
          price_per_night: 60,
          num_of_guests: 2,
          num_of_beds: 2,
          private_bathroom: false
        },
        {
          accommodation_id: rubavuGuesthouse?.id,
          room_name: 'Room C',
          description: 'Cozy single room with desk.',
          price_per_night: 50,
          num_of_guests: 1,
          num_of_beds: 1,
          private_bathroom: false
        },
        // Garden Cottage rooms
        {
          accommodation_id: gardenCottage?.id,
          room_name: 'Sunrise Room',
          description: 'Bright room with large windows.',
          price_per_night: 65,
          num_of_guests: 2,
          num_of_beds: 1,
          private_bathroom: true
        },
        {
          accommodation_id: gardenCottage?.id,
          room_name: 'Fern Room',
          description: 'Peaceful room overlooking the garden.',
          price_per_night: 60,
          num_of_guests: 2,
          num_of_beds: 1,
          private_bathroom: true
        },
        {
          accommodation_id: gardenCottage?.id,
          room_name: 'Orchid Room',
          description: 'Deluxe room with king bed.',
          price_per_night: 80,
          num_of_guests: 2,
          num_of_beds: 1,
          private_bathroom: true
        }
      ]);
    
    if (roomsError) {
      console.error('Error inserting accommodation rooms:', roomsError);
      process.exit(1);
    }
    
    console.log('Accommodation rooms inserted successfully');
    
    // Insert accommodation gallery
    console.log('Inserting accommodation gallery...');
    
    // Get all accommodations for gallery
    const galleryAccommodations = accommodationsData || [];
    const lakeViewVilla = galleryAccommodations.find(acc => acc.title === 'Lake View Villa');
    const rubavuGuesthouseGallery = galleryAccommodations.find(acc => acc.title === 'Rubavu Guesthouse');
    const gardenCottageGallery = galleryAccommodations.find(acc => acc.title === 'Garden Cottage');
    const cityStudio = galleryAccommodations.find(acc => acc.title === 'City Studio');
    
    const { error: galleryError } = await supabase
      .from('accommodation_gallery')
      .insert([
        // Lake View Villa images
        { accommodation_id: lakeViewVilla?.id, image_url: '/images/villa.jpg' },
        { accommodation_id: lakeViewVilla?.id, image_url: '/images/kivu.jpg' },
        { accommodation_id: lakeViewVilla?.id, image_url: '/images/side.jpg' },
        
        // Rubavu Guesthouse images
        { accommodation_id: rubavuGuesthouseGallery?.id, image_url: '/images/condo.jpg' },
        { accommodation_id: rubavuGuesthouseGallery?.id, image_url: '/images/sallon.jpg' },
        { accommodation_id: rubavuGuesthouseGallery?.id, image_url: '/images/bedroom.jpg' },
        
        // Garden Cottage images
        { accommodation_id: gardenCottageGallery?.id, image_url: '/images/cozy.jpg' },
        { accommodation_id: gardenCottageGallery?.id, image_url: '/images/garden-cottage-2.jpg' },
        { accommodation_id: gardenCottageGallery?.id, image_url: '/images/garden-cottage-3.jpg' },
        
        // City Studio images
        { accommodation_id: cityStudio?.id, image_url: '/images/Room1.jpg' },
        { accommodation_id: cityStudio?.id, image_url: '/images/Room2.jpg' }
      ]);
    
    if (galleryError) {
      console.error('Error inserting accommodation gallery:', galleryError);
      process.exit(1);
    }
    
    console.log('Accommodation gallery inserted successfully');
    
    // Insert bookings
    console.log('Inserting bookings...');
    
    // Get customer IDs
    const customers = usersData?.filter(user => user.role === 'customer') || [];
    const johnDoe = customers.find(customer => customer.email === 'john.doe@example.com');
    const janeSmith = customers.find(customer => customer.email === 'jane.smith@example.com');
    const alexMwiza = customers.find(customer => customer.email === 'alex.mwiza@example.com');
    
    // Get accommodation IDs
    const lakeViewVillaBooking = galleryAccommodations.find(acc => acc.title === 'Lake View Villa');
    const downtownApartment = galleryAccommodations.find(acc => acc.title === 'Downtown Apartment');
    const rubavuGuesthouseBooking = galleryAccommodations.find(acc => acc.title === 'Rubavu Guesthouse');
    const gardenCottageBooking = galleryAccommodations.find(acc => acc.title === 'Garden Cottage');
    
    // Get room IDs
    const { data: roomsData, error: roomsFetchError } = await supabase
      .from('accommodation_rooms')
      .select('id, room_name, accommodation_id');
    
    if (roomsFetchError) {
      console.error('Error fetching rooms:', roomsFetchError);
      process.exit(1);
    }
    
    const roomA = roomsData?.find(room => room.room_name === 'Room A' && room.accommodation_id === rubavuGuesthouseBooking?.id);
    const sunriseRoom = roomsData?.find(room => room.room_name === 'Sunrise Room' && room.accommodation_id === gardenCottageBooking?.id);
    
    const { error: bookingsError } = await supabase
      .from('bookings')
      .insert([
        // Whole-house bookings
        {
          accommodation_id: lakeViewVillaBooking?.id,
          room_id: null,
          customer_id: johnDoe?.id,
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '+250781234567',
          street_address: '123 Main Street',
          city: 'Kigali',
          check_in_date: new Date('2025-10-20'),
          check_out_date: new Date('2025-10-23'),
          num_of_guests: 4,
          status: 'confirmed'
        },
        {
          accommodation_id: downtownApartment?.id,
          room_id: null,
          customer_id: alexMwiza?.id,
          full_name: 'Alex Mwiza',
          email: 'alex.mwiza@example.com',
          phone_number: '+250780112233',
          street_address: '10 Nyamirambo Ave',
          city: 'Kigali',
          check_in_date: new Date('2025-11-05'),
          check_out_date: new Date('2025-11-07'),
          num_of_guests: 2,
          status: 'pending'
        },
        // Per-room bookings
        {
          accommodation_id: rubavuGuesthouseBooking?.id,
          room_id: roomA?.id,
          customer_id: johnDoe?.id,
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '+250781234567',
          street_address: '123 Main Street',
          city: 'Kigali',
          check_in_date: new Date('2025-10-25'),
          check_out_date: new Date('2025-10-27'),
          num_of_guests: 2,
          status: 'confirmed'
        },
        {
          accommodation_id: gardenCottageBooking?.id,
          room_id: sunriseRoom?.id,
          customer_id: janeSmith?.id,
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone_number: '+250789876543',
          street_address: '45 Market Road',
          city: 'Rubavu',
          check_in_date: new Date('2025-12-01'),
          check_out_date: new Date('2025-12-03'),
          num_of_guests: 2,
          status: 'cancelled'
        }
      ]);
    
    if (bookingsError) {
      console.error('Error inserting bookings:', bookingsError);
      process.exit(1);
    }
    
    console.log('Bookings inserted successfully');
    
    console.log('Database populated successfully with sample data!');
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the function
populateDatabase();