-- Add new verification-related fields to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS verification_status TEXT GENERATED ALWAYS AS (
  CASE
    WHEN is_verified = true THEN 'verified'
    WHEN is_verified = false THEN 'pending'
    ELSE 'pending'
  END
) STORED;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS ffl_number TEXT;

ALTER TABLE public.listings
ADD CONSTRAINT listings_ffl_number_unique UNIQUE (ffl_number);

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS submitted_documents JSONB DEFAULT '{}'::jsonb;

-- Business claims table
CREATE TABLE IF NOT EXISTS public.business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimer_email TEXT,
  ffl_license_number TEXT,
  verification_documents TEXT,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Allow only one pending claim per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_claim_per_listing
ON public.business_claims (listing_id)
WHERE (status = 'pending');
