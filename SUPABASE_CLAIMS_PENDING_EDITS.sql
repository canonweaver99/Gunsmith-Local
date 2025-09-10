-- Claiming & Verification overhaul (FFL optional at claim)
-- Safe to run multiple times

-- 1) Extend listings with claimed_by/claimed_at for audit (optional convenience)
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS claimed_by UUID,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- 2) pending_edits table to hold proposed edits until admin approval
CREATE TABLE IF NOT EXISTS public.pending_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.business_claims(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edits JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_pending_edits_listing ON public.pending_edits(listing_id);
CREATE INDEX IF NOT EXISTS idx_pending_edits_editor ON public.pending_edits(editor_id);
CREATE INDEX IF NOT EXISTS idx_pending_edits_status ON public.pending_edits(status);

ALTER TABLE public.pending_edits ENABLE ROW LEVEL SECURITY;

-- RLS: editors can view their own; admins can view all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pending_edits' AND policyname = 'Editors can view their own edits'
  ) THEN
    CREATE POLICY "Editors can view their own edits" ON public.pending_edits
      FOR SELECT USING (auth.uid() = editor_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pending_edits' AND policyname = 'Editors can insert their own edits'
  ) THEN
    CREATE POLICY "Editors can insert their own edits" ON public.pending_edits
      FOR INSERT WITH CHECK (auth.uid() = editor_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pending_edits' AND policyname = 'Admins can view all edits'
  ) THEN
    CREATE POLICY "Admins can view all edits" ON public.pending_edits
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  END IF;
END$$;

GRANT ALL ON public.pending_edits TO authenticated;
GRANT ALL ON public.pending_edits TO service_role;

-- 3) Update business_claims to separate claim_status vs verification_status + optional FFL doc
ALTER TABLE public.business_claims
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS ffl_document_url TEXT,
ALTER COLUMN ffl_license_number DROP NOT NULL;

-- Migrate legacy status -> claim_status
UPDATE public.business_claims
SET claim_status = COALESCE(claim_status, status)
WHERE status IS NOT NULL;

-- One active claim per user and per business (active = pending or approved)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_active_claim_per_user'
  ) THEN
    CREATE UNIQUE INDEX uniq_active_claim_per_user
      ON public.business_claims(claimer_id)
      WHERE claim_status IN ('pending','approved');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_active_claim_per_listing'
  ) THEN
    CREATE UNIQUE INDEX uniq_active_claim_per_listing
      ON public.business_claims(listing_id)
      WHERE claim_status IN ('pending','approved');
  END IF;
END$$;

-- 4) SECURITY DEFINER RPCs

-- Helper: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = uid AND p.is_admin = true
  );
$$;

-- RPC: create_business_claim
-- Enforces one active claim per user and listing, writes pending_edits
CREATE OR REPLACE FUNCTION public.create_business_claim(
  in_listing_id UUID,
  in_proposed_edits JSONB,
  in_ffl_license_number TEXT DEFAULT NULL,
  in_ffl_document_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_claim_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Enforce one active claim per user
  IF EXISTS (
    SELECT 1 FROM public.business_claims
    WHERE claimer_id = v_uid AND claim_status IN ('pending','approved')
  ) THEN
    RAISE EXCEPTION 'User already has an active claim';
  END IF;

  -- Enforce one active claim per listing
  IF EXISTS (
    SELECT 1 FROM public.business_claims
    WHERE listing_id = in_listing_id AND claim_status IN ('pending','approved')
  ) THEN
    RAISE EXCEPTION 'This business already has an active claim';
  END IF;

  INSERT INTO public.business_claims (
    listing_id, claimer_id, claimer_email, ffl_license_number, ffl_document_url,
    additional_info, claim_status, verification_status, submitted_at
  )
  SELECT l.id, v_uid, coalesce(p.email, ''), in_ffl_license_number, in_ffl_document_url,
         NULL, 'pending', 'unverified', now()
  FROM public.listings l
  LEFT JOIN public.profiles p ON p.id = v_uid
  WHERE l.id = in_listing_id
  RETURNING id INTO v_claim_id;

  INSERT INTO public.pending_edits (claim_id, listing_id, editor_id, edits)
  VALUES (v_claim_id, in_listing_id, v_uid, COALESCE(in_proposed_edits, '{}'::jsonb));

  RETURN v_claim_id;
END$$;

-- RPC: admin_review_claim (approve or reject and optionally verify when FFL doc exists)
CREATE OR REPLACE FUNCTION public.admin_review_claim(
  in_claim_id UUID,
  in_approve BOOLEAN
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_is_admin BOOLEAN;
  v_listing_id UUID;
  v_claimer UUID;
  v_edits JSONB;
  v_ffl_doc TEXT;
BEGIN
  SELECT public.is_admin(v_uid) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT bc.listing_id, bc.claimer_id, bc.ffl_document_url
  INTO v_listing_id, v_claimer, v_ffl_doc
  FROM public.business_claims bc
  WHERE bc.id = in_claim_id;

  IF v_listing_id IS NULL THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;

  SELECT pe.edits INTO v_edits
  FROM public.pending_edits pe
  WHERE pe.claim_id = in_claim_id
  ORDER BY pe.created_at DESC
  LIMIT 1;

  IF in_approve THEN
    -- Apply edits (only known safe fields)
    UPDATE public.listings SET
      business_name = COALESCE(v_edits->>'business_name', business_name),
      phone = COALESCE(v_edits->>'phone', phone),
      email = COALESCE(v_edits->>'email', email),
      website = COALESCE(v_edits->>'website', website),
      address = COALESCE(v_edits->>'address', address),
      street_address = COALESCE(v_edits->>'street_address', street_address),
      city = COALESCE(v_edits->>'city', city),
      state_province = COALESCE(v_edits->>'state_province', state_province),
      postal_code = COALESCE(v_edits->>'postal_code', postal_code),
      business_hours = COALESCE(NULLIF(v_edits->'business_hours','null'::jsonb), business_hours),
      owner_id = COALESCE(v_claimer, owner_id),
      claimed_by = COALESCE(v_claimer, claimed_by),
      claimed_at = now(),
      updated_at = now()
    WHERE id = v_listing_id;

    UPDATE public.business_claims
    SET claim_status = 'approved', reviewed_at = now(), reviewed_by = v_uid
    WHERE id = in_claim_id;

    UPDATE public.pending_edits
    SET status = 'approved', reviewed_at = now(), reviewed_by = v_uid
    WHERE claim_id = in_claim_id;

    -- Verify if FFL doc present
    IF v_ffl_doc IS NOT NULL AND length(v_ffl_doc) > 0 THEN
      UPDATE public.listings
      SET is_verified = true, verification_status = 'verified', verified_at = now(), verified_by = v_uid
      WHERE id = v_listing_id;
    END IF;
  ELSE
    UPDATE public.business_claims
    SET claim_status = 'rejected', reviewed_at = now(), reviewed_by = v_uid
    WHERE id = in_claim_id;

    UPDATE public.pending_edits
    SET status = 'rejected', reviewed_at = now(), reviewed_by = v_uid
    WHERE claim_id = in_claim_id;
  END IF;
END$$;

-- RPC: admin_create_listing - inserts a listing with claimed_by NULL
CREATE OR REPLACE FUNCTION public.admin_create_listing(p_listing JSONB)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_is_admin BOOLEAN;
  v_id UUID;
BEGIN
  SELECT public.is_admin(v_uid) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  INSERT INTO public.listings (
    business_name, slug, description, category,
    address, city, state_province, postal_code,
    latitude, longitude, phone, email, website,
    cover_image_url, business_hours, is_featured,
    verification_status, status
  ) VALUES (
    p_listing->>'business_name', p_listing->>'slug', p_listing->>'description', p_listing->>'category',
    p_listing->>'address', p_listing->>'city', p_listing->>'state_province', p_listing->>'postal_code',
    NULLIF((p_listing->>'latitude')::text,'')::numeric, NULLIF((p_listing->>'longitude')::text,'')::numeric,
    p_listing->>'phone', p_listing->>'email', p_listing->>'website',
    p_listing->>'cover_image_url', p_listing->'business_hours', COALESCE((p_listing->>'is_featured')::boolean, false),
    COALESCE(p_listing->>'verification_status','unverified'), COALESCE(p_listing->>'status','active')
  ) RETURNING id INTO v_id;
  RETURN v_id;
END$$;


