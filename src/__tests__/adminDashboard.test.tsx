import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../app/admin/page';

// Mock the useAuth hook
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      full_name: 'Admin User',
    },
  }),
}));

// Mock the supabaseAdmin client
jest.mock('../lib/supabaseClient', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue({ count: 10, error: null }),
  },
}));

// Mock the AdminNavigation component
jest.mock('../app/admin/components/AdminNavigation', () => {
  return function MockAdminNavigation() {
    return <div data-testid="admin-navigation">Admin Navigation</div>;
  };
});

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock the ProtectedRoute component
jest.mock('../app/components/ProtectedRoute', () => {
  const MockProtectedRoute = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  MockProtectedRoute.displayName = 'MockProtectedRoute';
  return MockProtectedRoute;
});

describe('AdminDashboard', () => {
  it('renders the admin dashboard with navigation', () => {
    render(<AdminDashboard />);
    
    // Check if the admin navigation is rendered
    expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
    
    // Check if the dashboard title is rendered
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    // Check if welcome message is rendered
    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
  });

  it('renders the stats overview section', () => {
    render(<AdminDashboard />);
    
    // Check if stats cards are rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Accommodations')).toBeInTheDocument();
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('Revenue (RWF)')).toBeInTheDocument();
  });

  it('renders the main functionality sections', () => {
    render(<AdminDashboard />);
    
    // Check if section titles are rendered
    expect(screen.getByText('Accommodations')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();
    expect(screen.getByText('Customer Inquiries')).toBeInTheDocument();
  });
});