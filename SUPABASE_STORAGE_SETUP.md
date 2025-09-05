# Supabase Storage Setup

This guide will help you set up the required storage buckets in Supabase for image uploads.

## Required Storage Buckets

### 1. Create the "listings" bucket

1. Go to your Supabase Dashboard
2. Navigate to Storage → Buckets
3. Click "Create bucket"
4. Set the following:
   - **Name**: `listings`
   - **Public bucket**: ✅ Yes (check this box)
   - Click "Create bucket"

### 2. Create the "profiles" bucket

1. Click "Create bucket" again
2. Set the following:
   - **Name**: `profiles`
   - **Public bucket**: ✅ Yes (check this box)
   - Click "Create bucket"

## Storage Policies

For both buckets, you'll need to set up the following policies:

### Listings Bucket Policies

1. Navigate to Storage → Policies
2. Select the `listings` bucket
3. Create the following policies:

#### Upload Policy
```sql
-- Policy name: Allow authenticated users to upload
-- Allowed operation: INSERT
-- Target roles: authenticated

(auth.uid() IS NOT NULL)
```

#### Update Policy
```sql
-- Policy name: Allow users to update their own images
-- Allowed operation: UPDATE
-- Target roles: authenticated

(auth.uid() IS NOT NULL)
```

#### Delete Policy
```sql
-- Policy name: Allow users to delete their own images
-- Allowed operation: DELETE
-- Target roles: authenticated

(auth.uid() IS NOT NULL)
```

#### Select Policy (Public Read)
```sql
-- Policy name: Allow public read access
-- Allowed operation: SELECT
-- Target roles: anon, authenticated

true
```

### Profiles Bucket Policies

Repeat the same policies for the `profiles` bucket.

## Directory Structure

The application will automatically organize files in the following structure:

```
listings/
├── logos/        # Business logo images
├── covers/       # Cover/banner images
└── gallery/      # Gallery images

profiles/
└── avatars/      # User profile pictures
```

## File Size Limits

Default limits in the application:
- Logo images: 2MB max
- Cover images: 5MB max
- Gallery images: 5MB max per image
- Avatar images: 2MB max

You can adjust these limits in the Supabase dashboard under Storage → Configuration.

## Supported File Types

The application accepts the following image formats:
- JPEG/JPG
- PNG
- WebP
- GIF

## Testing

After setup, test the image upload functionality by:
1. Adding a new business listing with images
2. Editing an existing listing to add/remove images
3. Updating your profile picture

## Troubleshooting

If uploads are failing:
1. Check that buckets are set to "public"
2. Verify all policies are correctly configured
3. Check the browser console for specific error messages
4. Ensure file sizes are within limits
5. Verify file types are supported

## Security Notes

- All uploaded files get unique filenames to prevent conflicts
- Original filenames are not preserved for security
- Files are organized by type in subdirectories
- Consider implementing virus scanning for production use
