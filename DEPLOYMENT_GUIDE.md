# Deployment Guide

This guide provides step-by-step instructions for deploying the Gisenyi Home Pass application to production.

## Prerequisites

1. A Supabase account (free tier available)
2. A Vercel account (free tier available)
3. A domain name (optional)

## Step 1: Prepare Your Supabase Project

1. Create a new project on [Supabase](https://supabase.com)
2. Get your project credentials:
   - Project URL
   - Anonymous Key (anon key)
   - Service Role Key
3. Set up the database:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database_schema.sql`
   - Run the script to create all tables and functions
4. Set up Storage:
   - Run the storage setup script:
     ```bash
     npx ts-node -P ts-node.config.json src/scripts/setupStorage.ts
     ```

## Step 2: Configure Environment Variables

Create a `.env.production` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Sign in to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables in the Vercel project settings
7. Deploy!

## Step 4: Post-Deployment Setup

1. Verify the application is working correctly
2. Test all functionality including:
   - User registration and login
   - Accommodation creation and management
   - Booking workflows
   - Review system
   - Email notifications
3. Create your first admin user:
   - Register a new user through the application
   - Update the user role to 'admin' in the database:
     ```sql
     UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
     ```

## Step 5: Custom Domain (Optional)

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow the DNS configuration instructions

## Monitoring and Maintenance

1. Monitor your Supabase usage in the dashboard
2. Set up email delivery monitoring
3. Regularly backup your database
4. Monitor application logs in Vercel

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**: Ensure all required environment variables are configured in Vercel
2. **Database Connection Errors**: Verify your Supabase credentials are correct
3. **Image Upload Issues**: Check that the storage bucket is properly configured
4. **Email Delivery Problems**: Verify your SMTP settings or use a service like SendGrid

### Support

For support, please open an issue in the GitHub repository or contact the development team.