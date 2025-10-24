# Admin Dashboard Documentation

## Overview
The Admin Dashboard provides comprehensive management capabilities for the Gisenya Home Pass platform. Administrators can manage accommodations, users, bookings, view analytics, and respond to customer inquiries.

## Features

### 1. Dashboard Overview
- Summary statistics for users, accommodations, bookings, and revenue
- Quick access to all major functionality areas

### 2. Accommodations Management
- View all accommodations in a searchable table
- Perform CRUD operations (Create, Read, Update, Delete)
- Filter and search accommodations by various criteria

### 3. User Management
- View all users (admins, hosts, customers)
- Approve pending host accounts
- Deactivate users when necessary
- Filter by user role and search by name/email

### 4. Booking Management
- View all bookings with status indicators
- Confirm, reject, or cancel pending bookings
- Filter by booking status
- View booking details and history

### 5. Analytics & Reports
- View key business metrics (bookings, revenue, users, occupancy)
- Filter data by custom time periods (7 days, 30 days, 90 days, 1 year)
- Download detailed reports in CSV format

*Note: This feature is currently dormant and will be activated when ready.*

### 6. Customer Inquiries
- View and respond to customer inquiries
- Track inquiry status (new, responded, closed)
- Search inquiries by customer name, email, or subject

## Access
To access the admin dashboard:
1. Log in with an account that has the "admin" role
2. Navigate to `/admin` to access the dashboard

## Navigation
The left sidebar provides quick navigation to all admin sections:
- Dashboard
- Accommodations
- Users
- Bookings
- Inquiries

*Note: The Analytics section is currently dormant and will be activated when ready.*

Each section provides specific functionality related to its domain.

## Security
- All admin functions are protected by role-based access control
- Only users with the "admin" role can access these pages
- All actions are logged for audit purposes