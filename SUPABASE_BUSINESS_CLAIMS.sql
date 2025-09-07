-- Create business_claims table for FFL verification when claiming existing businesses
CREATE TABLE IF NOT EXISTS public.business_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    claimer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    claimer_email VARCHAR(255) NOT NULL,
    
    -- FFL Verification
    ffl_license_number VARCHAR(50) NOT NULL,
    verification_documents TEXT,
    additional_info TEXT,
    
    -- Claim status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_business_claims_listing_id ON public.business_claims(listing_id);
CREATE INDEX idx_business_claims_claimer_id ON public.business_claims(claimer_id);
CREATE INDEX idx_business_claims_status ON public.business_claims(status);
CREATE INDEX idx_business_claims_submitted_at ON public.business_claims(submitted_at);

-- Enable RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own claims" ON public.business_claims
    FOR SELECT USING (auth.uid() = claimer_id);

CREATE POLICY "Users can insert their own claims" ON public.business_claims
    FOR INSERT WITH CHECK (auth.uid() = claimer_id);

CREATE POLICY "Admins can view all claims" ON public.business_claims
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Grant permissions
GRANT ALL ON public.business_claims TO authenticated;
GRANT ALL ON public.business_claims TO service_role;

-- Create view for admin to manage claims
CREATE OR REPLACE VIEW public.admin_business_claims AS
SELECT 
    bc.id,
    bc.listing_id,
    bc.claimer_id,
    bc.claimer_email,
    bc.ffl_license_number,
    bc.verification_documents,
    bc.additional_info,
    bc.status,
    bc.admin_notes,
    bc.reviewed_by,
    bc.reviewed_at,
    bc.submitted_at,
    l.business_name,
    l.street_address,
    l.city,
    l.state_province,
    l.phone as business_phone,
    p.full_name as claimer_name
FROM public.business_claims bc
JOIN public.listings l ON bc.listing_id = l.id
LEFT JOIN public.profiles p ON bc.claimer_id = p.id
ORDER BY bc.submitted_at DESC;

-- Grant access to admin view
GRANT SELECT ON public.admin_business_claims TO authenticated;

-- Add constraint to prevent multiple pending claims for same listing
CREATE UNIQUE INDEX idx_unique_pending_claim_per_listing
ON public.business_claims (listing_id)
WHERE (status = 'pending');

-- Add constraint to prevent users from claiming multiple times
CREATE UNIQUE INDEX idx_unique_pending_claim_per_user_listing
ON public.business_claims (listing_id, claimer_id)
WHERE (status = 'pending');

-- Function to approve business claim
CREATE OR REPLACE FUNCTION public.approve_business_claim(
    claim_id UUID,
    admin_user_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    claim_record RECORD;
BEGIN
    -- Get the claim record
    SELECT bc.*, l.id as listing_id
    INTO claim_record
    FROM public.business_claims bc
    JOIN public.listings l ON bc.listing_id = l.id
    WHERE bc.id = claim_id AND bc.status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update the listing owner
    UPDATE public.listings 
    SET 
        owner_id = claim_record.claimer_id,
        updated_at = NOW()
    WHERE id = claim_record.listing_id;
    
    -- Update the claim status
    UPDATE public.business_claims 
    SET 
        status = 'approved',
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        admin_notes = notes,
        updated_at = NOW()
    WHERE id = claim_id;
    
    -- Reject any other pending claims for this listing
    UPDATE public.business_claims 
    SET 
        status = 'rejected',
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        admin_notes = 'Another claim was approved for this listing',
        updated_at = NOW()
    WHERE listing_id = claim_record.listing_id 
    AND id != claim_id 
    AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject business claim
CREATE OR REPLACE FUNCTION public.reject_business_claim(
    claim_id UUID,
    admin_user_id UUID,
    notes TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.business_claims 
    SET 
        status = 'rejected',
        reviewed_by = admin_user_id,
        reviewed_at = NOW(),
        admin_notes = notes,
        updated_at = NOW()
    WHERE id = claim_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.approve_business_claim(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_business_claim(UUID, UUID, TEXT) TO authenticated;

COMMENT ON TABLE public.business_claims IS 'Tracks requests to claim ownership of existing business listings';
COMMENT ON COLUMN public.business_claims.ffl_license_number IS 'FFL license number for verification';
COMMENT ON COLUMN public.business_claims.status IS 'Claim status: pending, approved, rejected';
COMMENT ON FUNCTION public.approve_business_claim(UUID, UUID, TEXT) IS 'Approves a business claim and transfers ownership';
COMMENT ON FUNCTION public.reject_business_claim(UUID, UUID, TEXT) IS 'Rejects a business claim with admin notes';
