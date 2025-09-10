-- DESTRUCTIVE MIGRATION: Prune public.listings to the final 26 columns
-- Run ONLY after confirming your app no longer needs the removed columns.
-- Keeps and normalizes these columns:
--   id, business_name, slug, description, short_description, category,
--   address, city, state_province, postal_code, latitude, longitude,
--   phone, email, website,
--   average_rating, total_reviews, business_hours, cover_image_url,
--   facebook_url, instagram_url, youtube_url,
--   is_featured, ffl_license_number,
--   status, created_at

begin;

-- 0) Safety: ensure required columns exist
alter table public.listings
  add column if not exists id uuid default gen_random_uuid() primary key,
  add column if not exists business_name text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists category text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state_province text,
  add column if not exists postal_code text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists average_rating numeric(2,1) not null default 0.0,
  add column if not exists total_reviews integer not null default 0,
  add column if not exists reviews_1_star integer not null default 0,
  add column if not exists reviews_2_star integer not null default 0,
  add column if not exists reviews_3_star integer not null default 0,
  add column if not exists reviews_4_star integer not null default 0,
  add column if not exists reviews_5_star integer not null default 0,
  add column if not exists business_hours jsonb default '{}'::jsonb,
  add column if not exists cover_image_url text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists ffl_license_number text,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now();

-- 1) Normalize address from legacy columns (only if legacy columns exist)
do $$
begin
  if exists (select 1 from information_schema.columns 
              where table_schema='public' and table_name='listings' and column_name='street_address')
     or exists (select 1 from information_schema.columns 
              where table_schema='public' and table_name='listings' and column_name='street_address_2') then
    update public.listings
    set address = coalesce(address,
                           trim(
                             coalesce(street_address,'') ||
                             case when street_address_2 is not null and street_address_2 <> '' then ' ' || street_address_2 else '' end
                           ))
    where (address is null or address = '')
      and (
        (exists (select 1 from information_schema.columns where table_schema='public' and table_name='listings' and column_name='street_address') and street_address is not null)
        or (exists (select 1 from information_schema.columns where table_schema='public' and table_name='listings' and column_name='street_address_2') and street_address_2 is not null)
      );
  end if;
end$$;

-- 2) Normalize FFL (legacy -> canonical) only if legacy column exists
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='listings' and column_name='ffl_number') then
    update public.listings
    set ffl_license_number = coalesce(ffl_license_number, ffl_number)
    where ffl_number is not null
      and (ffl_license_number is null or ffl_license_number = '');
  end if;
end$$;

-- 3) Drop constraints tied to legacy columns if they exist
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'listings_ffl_number_unique') then
    alter table public.listings drop constraint listings_ffl_number_unique;
  end if;
end $$;

-- 4) Drop every column not in the final 26
alter table public.listings
  drop column if exists country,
  drop column if exists logo_url,
  drop column if exists gallery_urls,
  drop column if exists services,
  drop column if exists year_established,
  -- keep is_verified because admin views/policies depend on it
  drop column if exists view_count,
  drop column if exists updated_at,
  drop column if exists additional_locations,
  drop column if exists image_gallery,
  drop column if exists twitter_url,
  drop column if exists linkedin_url,
  drop column if exists tags,
  -- keep street_address and street_address_2 due to dependent views
  -- keep verification_status due to admin_verification_queue dependency
  drop column if exists verified_at,
  drop column if exists verified_by,
  drop column if exists featured_until,
  drop column if exists featured_payment_id,
  drop column if exists submitted_documents,
  drop column if exists google_place_id,
  drop column if exists business_status,
  drop column if exists timezone,
  drop column if exists phone_secondary,
  drop column if exists email_secondary,
  drop column if exists employee_count,
  drop column if exists google_reviews_link,
  drop column if exists google_maps_link,
  drop column if exists street_view_url,
  drop column if exists borough,
  drop column if exists h3_index,
  drop column if exists payment_methods,
  drop column if exists accessibility_features,
  drop column if exists service_features,
  drop column if exists area_service,
  drop column if exists photos_count,
  drop column if exists price_level,
  drop column if exists ffl_number;

-- 5) Helpful indexes (recreate/ensure)
create unique index if not exists listings_slug_uidx on public.listings(slug);
create index if not exists listings_state_city_idx on public.listings(state_province, city);
create index if not exists listings_is_featured_idx on public.listings(is_featured);
create index if not exists listings_rating_idx on public.listings(average_rating desc, total_reviews desc);

commit;


