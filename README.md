# Gisenyi Home Pass - Accommodation Booking Platform

A comprehensive accommodation booking platform built with Next.js 15 and Supabase, featuring user management, property listings, booking workflows, and review systems.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Key Features

### 🧩 Advanced User Management
- **Role-based Access Control**: Admin, Host, and Customer roles with distinct permissions
- **Secure Authentication**: Email verification, password reset, and session management
- **Profile Management**: Edit personal information and change passwords
- **Host Approval Workflow**: Dedicated process for host account verification

### 🏠 Comprehensive Accommodation System
- **Flexible Property Listings**: Support for both houses and individual rooms
- **Image Management**: Drag-and-drop upload for property and room galleries
- **Room Booking**: Option to book entire accommodations or individual rooms
- **Advanced Search**: Filter by location, price, guests, amenities, and more
- **Amenity Support**: Extensive amenity options with visual icons

### 🧳 Complete Booking Workflow
- **Real-time Availability**: Instant checking of booking dates
- **Status Management**: Track bookings through pending, confirmed, rejected, and cancelled states
- **Guest Booking**: Support for both registered users and guest bookings
- **Cancellation Policies**: Configurable policies (free, partial, none)

### ⭐ Review & Rating System
- **User Reviews**: Rating and comment functionality for completed stays
- **Automatic Calculations**: Real-time accommodation rating updates
- **Eligibility Controls**: Restrictions to ensure only legitimate reviews
- **Admin Oversight**: Override capabilities for review management

### 📊 Admin Dashboard
- **Full CRUD Operations**: Manage accommodations, users, bookings, and reviews
- **Inquiry Management**: Handle customer questions and feedback
- **Analytics Ready**: Data structure prepared for business insights
- **Visual Management**: Intuitive interfaces for all admin functions

### 📧 Automated Notifications
- **Event-based Emails**: Automated messages for all key actions
- **Booking Updates**: Real-time status change notifications
- **Host Approvals**: Workflow notifications for account verification
- **Account Security**: Verification and password reset emails

## 🛠 Technical Stack

- **Frontend**: Next.js 15 with React 19 and App Router
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS with modern UI components
- **State Management**: React Query for server state
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icon library
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest and React Testing Library
- **Deployment**: Vercel-ready with Docker support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (or Docker for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gisenyi-home-pass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Update the variables with your Supabase credentials from https://app.supabase.com/
   ```

4. **Important**: Set up a Supabase project:
   - Go to [Supabase](https://supabase.com) and create a free account
   - Create a new project
   - Get your Project URL and API keys from Settings > API
   - Update your `.env.local` file with these credentials

5. Set up the database schema:
   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `database_schema.sql` and run it

6. Set up Supabase Storage:
   ```bash
   npx ts-node -P ts-node.config.json src/scripts/setupStorage.ts
   ```

7. Run the development server:
   ```bash
   npm run dev
   ```

### Alternative: Local Development with Docker
If you prefer to run Supabase locally:

1. Install Docker Desktop
2. Navigate to the `supabase/docker` directory
3. Run:
   ```bash
   docker compose -f docker-compose.yml -f ./dev/docker-compose.dev.yml up -d
   ```
4. Update your `.env.local` with the local Supabase credentials

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages and layouts
│   ├── about/             # About page
│   ├── accommodations/    # Accommodation listings and details
│   ├── admin/             # Admin dashboard with sub-sections
│   ├── api/               # API routes for backend functionality
│   ├── bookings/          # Booking management pages
│   ├── components/        # Shared components and UI elements
│   ├── contact/           # Contact and inquiry pages
│   ├── customer/          # Customer dashboard
│   ├── login/             # Authentication pages
│   ├── owner/             # Host/owner dashboard
│   ├── profile/           # User profile management
│   ├── providers/         # React context providers
│   ├── roomDetails/       # Individual room detail pages
│   └── verify/            # Email verification pages
├── context/               # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Helper functions and utilities
├── scripts/               # Database and utility scripts
└── types/                 # TypeScript type definitions
```

## 📘 Documentation

- [Accommodation Management](ACCOMMODATION_MANAGEMENT.md) - Image upload and room management features
- [Profile Management](PROFILE_MANAGEMENT.md) - User profile editing and password changes
- [Inquiries Management](INQUIRIES_MANAGEMENT.md) - Customer inquiry handling
- [Database Schema](database_schema.sql) - Complete SQL schema definition

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run specific functionality tests:
```bash
# Test Supabase connection
npm run supabase:test-connection

# Test accommodation fetching with reviews
npm run supabase:test-with-reviews

# Test customer inquiries
npm run supabase:test-inquiries
```

## 🔧 Key Helper Libraries

- `supabaseHelpers.ts` - Core database operations and Supabase integration
- `accommodationHelpers.ts` - Accommodation management and search functions
- `bookingHelpers.ts` - Booking validation and management utilities
- `bookingWorkflow.ts` - Complete booking workflows and status management
- `reviewHelpers.ts` - Review validation and management functions
- `reviewWorkflow.ts` - Complete review workflows and eligibility checks
- `emailHelpers.ts` - Email sending, templating, and verification
- `notificationSystem.ts` - Notification dispatch and audit logging
- `authService.ts` - Authentication service layer and user management
- `rbac.ts` - Role-based access control utilities

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

For Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Add your Supabase environment variables in Vercel settings
3. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the open-source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework