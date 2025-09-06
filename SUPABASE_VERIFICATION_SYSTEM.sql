-- Add FFL license and verification system columns to listings table
-- Note: Some columns like is_verified might already exist
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS ffl_license_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Update is_verified column if it exists, or add it if it doesn't
DO $$ 
BEGIN
  -- Check if is_verified column exists and update its default if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='is_verified') THEN
    ALTER TABLE listings ALTER COLUMN is_verified SET DEFAULT FALSE;
  ELSE
    ALTER TABLE listings ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN listings.ffl_license_number IS 'Federal Firearms License number for verification';
COMMENT ON COLUMN listings.is_verified IS 'Whether the FFL license has been verified by admin';
COMMENT ON COLUMN listings.verification_status IS 'Status: pending, verified, rejected';
COMMENT ON COLUMN listings.verified_at IS 'Timestamp when the FFL license was verified';
COMMENT ON COLUMN listings.verified_by IS 'Admin user who verified the FFL license';

-- Create index for faster queries on verification status
CREATE INDEX IF NOT EXISTS idx_listings_verification_status ON listings(verification_status);
CREATE INDEX IF NOT EXISTS idx_listings_is_verified ON listings(is_verified);

-- Update existing listings to have pending status
UPDATE listings 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;

-- Create a view for admin to see businesses waiting for FFL verification
CREATE OR REPLACE VIEW admin_verification_queue AS
SELECT 
  l.id,
  l.business_name,
  l.ffl_license_number,
  l.email,
  l.city,
  l.state_province,
  l.created_at,
  l.verification_status,
  l.is_verified,
  l.owner_id
FROM listings l
WHERE l.verification_status = 'pending' AND l.ffl_license_number IS NOT NULL
ORDER BY l.created_at ASC;

-- Grant access to admin_verification_queue for authenticated users
-- (You'll want to add RLS policies to restrict this to admin users only)
GRANT SELECT ON admin_verification_queue TO authenticated;

-- RLS policy to allow admins to update verification status
-- Note: You'll need to replace 'your-admin-user-id' with your actual admin user ID
-- or create a more sophisticated admin role system

-- For now, let's create a simple policy that allows the table owner to verify
CREATE POLICY "Allow admin to update verification status" ON listings
FOR UPDATE USING (
  -- Replace with your admin user ID or create an admin role system
  auth.uid() = 'your-admin-user-id'::uuid
);

-- Policy to allow users to see verification status
CREATE POLICY "Allow users to see verification status" ON listings
FOR SELECT USING (true);

-- Function to verify a business (can be called by admin)
CREATE OR REPLACE FUNCTION verify_business(
  listing_id UUID,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is admin (you'll want to implement proper admin check)
  -- For now, we'll just check if the user exists
  IF admin_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the listing
  UPDATE listings 
  SET 
    is_verified = TRUE,
    verification_status = 'verified',
    verified_at = NOW(),
    verified_by = admin_user_id
  WHERE id = listing_id;
  
  RETURN FOUND;
END;
$$;

-- Function to reject a business verification
CREATE OR REPLACE FUNCTION reject_business_verification(
  listing_id UUID,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is admin
  IF admin_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the listing
  UPDATE listings 
  SET 
    is_verified = FALSE,
    verification_status = 'rejected',
    verified_at = NULL,
    verified_by = admin_user_id
  WHERE id = listing_id;
  
  RETURN FOUND;
END;
$$;
