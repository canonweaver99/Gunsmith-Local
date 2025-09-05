# Admin Dashboard Setup

This guide will help you set up the admin functionality in your Supabase database.

## Database Setup

### 1. Add admin field to profiles table

Run this SQL query in your Supabase SQL editor:

```sql
-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
```

### 2. Create your first admin user

To make a user an admin, you need their user ID. You can find this in:
1. Supabase Dashboard → Authentication → Users
2. Copy the user's ID

Then run this SQL query, replacing `YOUR_USER_ID` with the actual ID:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID';
```

## Admin Features

Once set up, admin users will have access to:

### 1. **Admin Dashboard** (`/admin`)
- Overview of platform statistics
- Total listings, users, messages, reviews
- Recent activity feed

### 2. **Manage Listings** (`/admin/listings`)
- View all listings with search and filters
- Change listing status (active, pending, inactive)
- Toggle verification badges
- Toggle featured status
- Edit any listing
- Delete listings

### 3. **Manage Users** (`/admin/users`)
- View all registered users
- See user statistics (listings count)
- Grant/revoke admin privileges
- Search users by name, email, or phone
- Delete users (requires additional setup)

### 4. **Admin Controls in Edit Forms**
When editing listings as an admin, you get additional controls:
- Status dropdown (active/pending/inactive)
- Verified checkbox
- Featured checkbox

## Security

The admin system includes:
- Server-side authentication checks
- Protected routes that redirect non-admins
- Admin status stored in secure database
- All admin actions logged with timestamps

## Adding More Admins

To add more admin users:
1. Have them create a regular account first
2. Find their user ID in Supabase Authentication
3. Run the UPDATE query above with their ID

## Removing Admin Access

To remove admin privileges:

```sql
UPDATE profiles 
SET is_admin = false 
WHERE id = 'USER_ID_TO_REMOVE';
```

## Admin Indicators

Admin users will see:
- "Admin" link in the navigation header (gold color)
- Shield icon next to the Admin link
- Access to admin-only pages

## Notes

- The first admin must be set up manually via SQL
- Admin users can grant admin access to others through the UI
- Admin deletion of users requires Supabase Admin API access (additional setup)
- All admin actions should be used responsibly
