console.log('Checking environment variables...');

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

if (!process.env.SERVICE_ROLE_KEY) {
  console.warn('WARNING: SERVICE_ROLE_KEY is not set - admin operations may fail');
  console.warn('This is likely the cause of your inquiries fetching error');
}