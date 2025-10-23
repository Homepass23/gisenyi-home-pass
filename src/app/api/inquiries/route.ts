import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { name, email, phone, subject, comment } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !comment) {
      return NextResponse.json(
        { error: 'Name, email, subject, and comment are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Insert inquiry into database
    const { data, error } = await supabaseAdmin
      .from('customer_inquiries')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          subject,
          message: comment,
          status: 'new'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting inquiry:', error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Inquiry submitted successfully', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}