-- Allow 'pending' status for new business submissions

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_status_check'
  ) THEN
    ALTER TABLE public.listings DROP CONSTRAINT listings_status_check;
  END IF;
END$$;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_status_check
  CHECK (lower(status) IN ('active','inactive','pending'));


