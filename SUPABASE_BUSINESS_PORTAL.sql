ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS verification_status TEXT GENERATED ALWAYS AS (
  CASE
    WHEN is_verified = true THEN 'verified'
    WHEN is_verified = false THEN 'pending'
    ELSE 'pending'
  END
) STORED;

-- Normalize on ffl_license_number everywhere
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS ffl_license_number TEXT;

-- Optional unique constraint (remove if multiple locations share same FFL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'listings_ffl_license_number_unique'
  ) THEN
    ALTER TABLE public.listings
    ADD CONSTRAINT listings_ffl_license_number_unique UNIQUE (ffl_license_number);
  END IF;
END$$;

-- Migrate any legacy values from ffl_number -> ffl_license_number, then drop ffl_number
-- (Safe to run multiple times)
update public.listings
set ffl_license_number = coalesce(ffl_license_number, ffl_number)
where ffl_number is not null
  and (ffl_license_number is null or ffl_license_number = '');

-- Drop old unique constraint if it existed
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'listings_ffl_number_unique'
  ) then
    alter table public.listings drop constraint listings_ffl_number_unique;
  end if;
end$$;

-- Finally drop the legacy column
alter table public.listings drop column if exists ffl_number;

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
