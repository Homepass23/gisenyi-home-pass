import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../app/components/shared/Modal';
import AccommodationForm from '../app/admin/components/AccommodationForm';

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Popup Forms', () => {
  it('renders modal component correctly', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    // Check if modal is rendered
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    
    // Check if close button is rendered
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    // Test closing the modal
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders accommodation form correctly', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <AccommodationForm 
        onSubmit={onSubmit} 
        onCancel={onCancel} 
      />
    );
    
    // Check if form fields are rendered
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Location *')).toBeInTheDocument();
    expect(screen.getByLabelText('Price per Night (RWF) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner/Host *')).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Accommodation')).toBeInTheDocument();
  });
});