# Customer Inquiries Management

This document explains how the customer inquiries feature works in the Gisenya Home Pass system.

## Overview

The customer inquiries feature allows website visitors to submit questions, feedback, or requests through the Contact Us page. These inquiries are stored in the database and can be managed by administrators through the admin panel.

## Database Structure

The system uses the `customer_inquiries` table which is already defined in the database schema:

```sql
CREATE TABLE customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status inquiry_status DEFAULT 'new',
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The `inquiry_status` enum has three possible values:
- `new` - A newly submitted inquiry that hasn't been addressed
- `responded` - An inquiry that has been responded to
- `closed` - An inquiry that has been resolved/closed

## How It Works

### 1. Frontend Form

The contact form is located in `src/app/components/shared/message.tsx` and is displayed on the Contact Us page. When a visitor submits the form:

1. The form data is validated on the client-side (name, email, subject, and comment are required)
2. The phone field is optional and will be stored if provided
3. A POST request is sent to `/api/inquiries`
4. On success, a confirmation message is shown to the user

### 2. API Endpoint

The API endpoint at `src/app/api/inquiries/route.ts` handles the form submission:

1. Validates the required fields (name, email, subject, comment)
2. Checks the email format
3. Inserts the inquiry into the `customer_inquiries` table including the phone number if provided
4. Returns a success or error response

### 3. Admin Management

Administrators can manage inquiries through the admin panel:

1. Navigate to the "Customer Inquiries" section in the admin dashboard
2. View all inquiries in a table format with their status
3. Click "View" to see details of a specific inquiry
4. Respond to inquiries and update their status
5. Close inquiries when they are resolved

## Scripts

Several helper scripts are available for managing inquiries:

- `npm run supabase:populate-inquiries` - Populates the database with sample inquiries for testing
- `npm run supabase:test-inquiries` - Tests the inquiries functionality
- `npm run supabase:test-inquiries-endpoint` - Tests the API endpoint directly

## Testing

To test the inquiries feature:

1. Make sure your Supabase environment variables are properly configured
2. Run the development server: `npm run dev`
3. Visit the Contact Us page (`/contact`)
4. Fill out and submit the form with all required fields including subject
5. Log in as an admin and navigate to the Inquiries section to view the submitted inquiry

## Customization

To customize the inquiries feature:

1. Modify the form fields in `src/app/components/shared/message.tsx`
2. Update the validation logic as needed
3. Adjust the API endpoint in `src/app/api/inquiries/route.ts` for additional processing
4. Customize the admin interface in `src/app/admin/inquiries/page.tsx`