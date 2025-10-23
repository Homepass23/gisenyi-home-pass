# Analytics Feature Activation Guide

## Overview
This document provides instructions for activating the dormant analytics feature in the admin dashboard.

## Current Status
The analytics feature is currently dormant and not accessible through the admin interface. The code is implemented but not linked.

## Files to Modify for Activation

### 1. Admin Navigation (`src/app/admin/components/AdminNavigation.tsx`)
Uncomment the analytics navigation item:
```typescript
const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Accommodations', href: '/admin/accommodations', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 }, // Uncomment this line
  { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
]
```

### 2. Admin Dashboard (`src/app/admin/page.tsx`)
Uncomment the analytics section:
```jsx
{/* Analytics & Reports */}
<div className="bg-white p-6 rounded-lg shadow-md">
  <div className="flex items-center mb-4">
    <BarChart3 className="h-6 w-6 text-sky-600 mr-2" />
    <h2 className="text-xl font-semibold">Analytics & Reports</h2>
  </div>
  <p className="text-gray-600 mb-4">View business analytics and reports</p>
  <div className="flex space-x-3">
    <a 
      href="/admin/analytics" 
      className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
    >
      View Reports
    </a>
  </div>
</div>
```

### 3. Analytics Page (`src/app/admin/analytics/page.tsx`)
Remove the dormancy comment block at the top of the file.

## Testing After Activation
1. Log in as an admin user
2. Verify the "Analytics" link appears in the navigation sidebar
3. Navigate to the Analytics page
4. Verify that data is loading correctly
5. Test all date range filters
6. Test the CSV export functionality

## Troubleshooting
If the analytics page doesn't load properly after activation:

1. Check the browser console for JavaScript errors
2. Verify that all environment variables are properly configured
3. Check the Supabase connection
4. Ensure the database schema is up to date
5. Review the server logs for any API errors

## Additional Considerations
- The analytics feature makes several database queries, so performance should be monitored
- Consider adding caching mechanisms for frequently accessed data
- Review data privacy requirements if handling sensitive user information