import { validateGuestBookingData } from '../../lib/guestBookingHelpers';

// Test the date validation fix
function testDateValidation() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const bookingData = {
    accommodation_id: 'acc-123',
    check_in_date: todayString,
    check_out_date: new Date(today.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
    num_of_guests: 2,
    full_name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    city: 'New York'
  };
  
  const result = validateGuestBookingData(bookingData);
  console.log('Validation result for today\'s date:', result);
  
  if (result.isValid) {
    console.log('✅ SUCCESS: Today\'s date is now correctly accepted as valid');
  } else {
    console.log('❌ FAILURE: Today\'s date is still being rejected');
    console.log('Errors:', result.errors);
  }
}

testDateValidation();