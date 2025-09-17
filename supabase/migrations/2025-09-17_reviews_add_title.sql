-- Add missing 'title' column to reviews to match application expectations
begin;

alter table public.reviews
  add column if not exists title text;

commit;


