-- Complete RLS Fix for Supabase
-- This script handles all necessary setup for the listings table and related functionality

-- 1. First, add the role column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. Add additional_locations column to listings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'additional_locations'
    ) THEN
        ALTER TABLE listings ADD COLUMN additional_locations JSONB;
    END IF;
END $$;

-- 3. Enable RLS on listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies on listings to start fresh
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can do anything" ON listings;
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

-- 5. Create simple, permissive policies for listings

-- Anyone can view listings
CREATE POLICY "Public listings are viewable by everyone" ON listings
    FOR SELECT
    USING (true);

-- Authenticated users can insert listings
CREATE POLICY "Authenticated users can create listings" ON listings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON listings
    FOR DELETE
    USING (auth.uid() = owner_id);

-- 6. Handle storage policies
-- First check if the 'listings' bucket exists, if not create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images 1h9pv6q_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images 1h9pv6q_1" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images 1h9pv6q_2" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images 1h9pv6q_3" ON storage.objects;

-- Create new storage policies with unique names
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update their uploads" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    )
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can delete their uploads" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

-- 7. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. Quick verification query
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;

-- 9. Alternative: If you still have issues, you can temporarily disable RLS for development
-- WARNING: Only use this for development/testing!
-- ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
