# Accommodation Management Features

This document outlines the enhanced accommodation management system with image upload and room management capabilities.

## Features Implemented

### 1. Image Upload System
- **Drag & Drop Interface**: Users can drag and drop images or click to select files
- **Multiple Image Support**: Upload up to 10 images per accommodation
- **Image Validation**: File type and size validation (max 5MB per image)
- **Supabase Storage**: Images are stored in the `accommodations` bucket
- **Gallery Management**: Full CRUD operations for accommodation gallery images

### 2. Room Management System
- **Independent Room Booking**: Accommodations can be configured to allow individual room bookings
- **Room CRUD Operations**: Create, read, update, and delete individual rooms
- **Room Details**: Each room can have:
  - Name and description
  - Price per night
  - Number of guests and beds
  - Private bathroom option
  - Image gallery (up to 5 images per room)
- **Visual Room Management**: Grid-based interface for managing rooms

### 3. Enhanced Admin Interface
- **Accommodation Form**: Updated with image upload and room management sections
- **Room Management Modal**: Dedicated interface for managing rooms
- **Action Buttons**: Quick access to edit accommodations and manage rooms
- **Visual Indicators**: Clear indication of which accommodations support room booking

## Database Schema

### Tables Used
1. **accommodations**: Main accommodation data
2. **accommodation_rooms**: Individual room data for accommodations that allow room booking
3. **accommodation_gallery**: Gallery images for accommodations

### Key Fields
- `allow_independent_room_booking`: Boolean flag to enable room management
- `image_gallery`: Array of image URLs for rooms
- `accommodation_id`: Foreign key linking rooms to accommodations

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── accommodations/
│   │   │   └── page.tsx (Enhanced with room management)
│   │   └── components/
│   │       ├── AccommodationForm.tsx (Updated with image upload)
│   │       └── RoomManagement.tsx (New room management component)
│   └── components/
│       └── shared/
│           └── ImageUpload.tsx (New image upload component)
├── lib/
│   └── supabaseHelpers.ts (Enhanced with room and gallery functions)
└── scripts/
    └── setupStorage.ts (Storage bucket setup script)
```

## Usage Guide

### For Administrators

#### Adding a New Accommodation
1. Navigate to Admin → Accommodations
2. Click "Add New"
3. Fill in accommodation details
4. Upload images using the drag & drop interface
5. Enable "Allow independent room booking" if needed
6. Save the accommodation
7. If room booking is enabled, click "Manage Rooms" to add individual rooms

#### Managing Rooms
1. Find an accommodation with room booking enabled
2. Click the bed icon (🛏️) in the actions column
3. Add new rooms with details like:
   - Room name and description
   - Price per night
   - Guest capacity and bed count
   - Private bathroom option
   - Room images
4. Edit or delete existing rooms as needed

#### Image Management
- **Accommodation Images**: Upload up to 10 images per accommodation
- **Room Images**: Upload up to 5 images per room
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **File Size Limit**: 5MB per image
- **Storage**: All images stored in Supabase Storage

### Technical Implementation

#### Image Upload Component
```tsx
<ImageUpload
  images={galleryImages}
  onImagesChange={setGalleryImages}
  maxImages={10}
  bucket="accommodations"
/>
```

#### Room Management Component
```tsx
<RoomManagement
  accommodationId={accommodation.id}
  accommodationTitle={accommodation.title}
  onClose={() => setShowRoomManagement(false)}
/>
```

#### Storage Functions
```typescript
// Upload image
const { data, error } = await supabase.storage
  .from('accommodations')
  .upload(fileName, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('accommodations')
  .getPublicUrl(data.path)
```

## Setup Instructions

### 1. Storage Bucket Setup
Run the storage setup script to create the necessary bucket and policies:

```bash
npx ts-node src/scripts/setupStorage.ts
```

### 2. Environment Variables
Ensure these environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SERVICE_ROLE_KEY`

### 3. Database Permissions
The system requires the following permissions:
- Read/Write access to `accommodations` table
- Read/Write access to `accommodation_rooms` table
- Read/Write access to `accommodation_gallery` table
- Storage bucket access for image uploads

## CRUD Operations Summary

### Accommodations
- ✅ **Create**: Add new accommodations with images
- ✅ **Read**: View all accommodations with search and filtering
- ✅ **Update**: Edit accommodation details and images
- ✅ **Delete**: Remove accommodations (cascades to rooms and gallery)

### Rooms
- ✅ **Create**: Add rooms to accommodations with room booking enabled
- ✅ **Read**: View all rooms for an accommodation
- ✅ **Update**: Edit room details and images
- ✅ **Delete**: Remove individual rooms

### Gallery Images
- ✅ **Create**: Upload images to accommodations and rooms
- ✅ **Read**: Display images in galleries
- ✅ **Update**: Replace or reorder images
- ✅ **Delete**: Remove images from galleries

## Error Handling

The system includes comprehensive error handling for:
- File upload failures
- Invalid file types or sizes
- Storage quota exceeded
- Network connectivity issues
- Database constraint violations

## Performance Considerations

- Images are optimized for web display
- Lazy loading implemented for image galleries
- Efficient database queries with proper indexing
- Storage bucket configured with appropriate limits

## Security Features

- File type validation
- File size limits
- Authenticated user access only
- Row Level Security (RLS) policies
- Secure image URLs with expiration

## Future Enhancements

Potential improvements could include:
- Image compression and optimization
- Bulk image upload
- Image editing capabilities
- Advanced room pricing (seasonal rates)
- Room availability calendar
- Automated image resizing
- CDN integration for faster image delivery
