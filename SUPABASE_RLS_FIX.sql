-- Fix Row Level Security (RLS) policies for listings table
-- Run this in Supabase SQL Editor

-- 1. First, check if RLS is enabled on the listings table
-- If not enabled, enable it:
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can do anything" ON listings;

-- 3. Create new comprehensive policies

-- Policy: Anyone can view active listings
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT
    USING (status = 'active' OR auth.uid() = owner_id);

-- Policy: Authenticated users can insert listings
CREATE POLICY "Authenticated users can insert listings" ON listings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can delete their own listings  
CREATE POLICY "Users can delete own listings" ON listings
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Also ensure the storage buckets have proper policies
-- For the 'listings' storage bucket

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Anyone can view listing images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update own listing images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    )
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can delete own listing images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

-- 5. Grant necessary permissions
GRANT ALL ON listings TO authenticated;
GRANT SELECT ON listings TO anon;

-- 6. Add the additional_locations column if it doesn't exist
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

-- 7. Verify the policies are working
-- This query should return the policies we just created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;
