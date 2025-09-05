-- Complete Database Schema Update for GunsmithLocal
-- This script adds all missing columns and ensures the database matches the application code

-- 1. Add missing columns to listings table
DO $$ 
BEGIN
    -- Add image_gallery column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'image_gallery'
    ) THEN
        ALTER TABLE listings ADD COLUMN image_gallery TEXT[];
    END IF;

    -- Add logo_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN logo_url TEXT;
    END IF;

    -- Add cover_image_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN cover_image_url TEXT;
    END IF;

    -- Add business_hours column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'business_hours'
    ) THEN
        ALTER TABLE listings ADD COLUMN business_hours JSONB;
    END IF;

    -- Add additional_locations column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'additional_locations'
    ) THEN
        ALTER TABLE listings ADD COLUMN additional_locations JSONB;
    END IF;

    -- Add owner_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE listings ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE listings ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- Add is_featured column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE listings ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- Add view_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'view_count'
    ) THEN
        ALTER TABLE listings ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;

    -- Add year_established column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'year_established'
    ) THEN
        ALTER TABLE listings ADD COLUMN year_established INTEGER;
    END IF;

    -- Add social media columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'facebook_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN facebook_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'twitter_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN twitter_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'instagram_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN instagram_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN linkedin_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'youtube_url'
    ) THEN
        ALTER TABLE listings ADD COLUMN youtube_url TEXT;
    END IF;

    -- Add tags column if it doesn't exist (should be TEXT[] for array of strings)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE listings ADD COLUMN tags TEXT[];
    END IF;

END $$;

-- 2. Add missing columns to profiles table
DO $$ 
BEGIN
    -- Add role column to profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 3. Create listings table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    street_address TEXT,
    street_address_2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    category TEXT,
    description TEXT,
    short_description TEXT,
    tags TEXT[],
    year_established INTEGER,
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    image_gallery TEXT[],
    business_hours JSONB,
    additional_locations JSONB,
    status TEXT DEFAULT 'active',
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    website TEXT,
    role TEXT DEFAULT 'user',
    notification_preferences JSONB DEFAULT '{"email_reviews": true, "email_messages": true, "email_marketing": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on both tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 7. Create simple, working policies for listings
CREATE POLICY "Anyone can view listings" ON listings
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert listings" ON listings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own listings" ON listings
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own listings" ON listings
    FOR DELETE
    USING (auth.uid() = owner_id);

-- 8. Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 9. Create storage bucket for listings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 10. Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

CREATE POLICY "Anyone can view listing images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update listing images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    )
    WITH CHECK (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can delete listing images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'listings' 
        AND auth.uid() IS NOT NULL
    );

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 12. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('listings', 'profiles')
ORDER BY table_name, ordinal_position;
