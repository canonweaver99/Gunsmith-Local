-- SUPABASE LISTINGS ENHANCEMENTS (single file reference)
-- This file contains:
-- 1) SQL migration (ALTER TABLE) for new columns
-- 2) Index recommendations
-- 3) RLS notes
-- 4) TypeScript interface (commented) to paste into src/lib/supabase.ts
-- 5) Supabase type generation command (commented)

-- ===============================================
-- 1) SQL MIGRATION (PostgreSQL / Supabase)
-- ===============================================
-- Table assumed: public.listings

-- HIGH PRIORITY columns
alter table public.listings
  add column if not exists average_rating numeric(2,1) not null default 0.0
    check (average_rating >= 0.0 and average_rating <= 5.0),
  add column if not exists total_reviews integer not null default 0,
  add column if not exists reviews_1_star integer not null default 0,
  add column if not exists reviews_2_star integer not null default 0,
  add column if not exists reviews_3_star integer not null default 0,
  add column if not exists reviews_4_star integer not null default 0,
  add column if not exists reviews_5_star integer not null default 0,
  add column if not exists price_level text
    check (price_level in ('$','$$','$$$','$$$$')),
  add column if not exists business_status text not null default 'OPERATIONAL'
    check (business_status in ('OPERATIONAL','TEMPORARILY_CLOSED','PERMANENTLY_CLOSED')),
  add column if not exists photos_count integer not null default 0,
  add column if not exists timezone text,
  add column if not exists google_place_id text,
  add column if not exists service_features jsonb not null default '{}'::jsonb,
  add column if not exists area_service boolean not null default false;

-- MEDIUM PRIORITY columns
alter table public.listings
  add column if not exists phone_secondary text,
  add column if not exists email_secondary text,
  add column if not exists employee_count integer,
  add column if not exists google_reviews_link text,
  add column if not exists google_maps_link text,
  add column if not exists street_view_url text,
  add column if not exists borough text,
  add column if not exists h3_index text,
  add column if not exists payment_methods text[] not null default '{}'::text[],
  add column if not exists accessibility_features text[] not null default '{}'::text[];

-- Optional unique constraint for google_place_id
create unique index if not exists listings_google_place_id_uidx
  on public.listings (google_place_id)
  where google_place_id is not null;

-- ===============================================
-- 2) INDEX RECOMMENDATIONS
-- ===============================================
create index if not exists listings_state_city_idx
  on public.listings (state_province, city);

create index if not exists listings_business_status_idx
  on public.listings (business_status);

create index if not exists listings_price_level_idx
  on public.listings (price_level);

create index if not exists listings_is_featured_idx
  on public.listings (is_featured);

create index if not exists listings_is_verified_idx
  on public.listings (is_verified);

create index if not exists listings_h3_idx
  on public.listings (h3_index);

create index if not exists listings_tags_gin_idx
  on public.listings using gin (tags);

create index if not exists listings_payment_methods_gin_idx
  on public.listings using gin (payment_methods);

create index if not exists listings_accessibility_features_gin_idx
  on public.listings using gin (accessibility_features);

create index if not exists listings_service_features_gin_idx
  on public.listings using gin (service_features);

create index if not exists listings_active_not_closed_idx
  on public.listings (state_province, city)
  where status = 'active' and business_status = 'OPERATIONAL';

-- ===============================================
-- 3) RLS POLICY NOTES (informational)
-- ===============================================
-- If RLS is enabled and policies already allow owners/admins to update rows,
-- no changes are required since new columns are additive.
-- Consider keeping verification/featured fields only writable via admin/service-role RPCs.

-- Example policies (for reference):
-- create policy if not exists listings_read_all on public.listings for select using (true);
-- create policy if not exists listings_update_owner on public.listings for update
--   using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ===============================================
-- 4) TYPESCRIPT INTERFACE SNIPPET (paste into src/lib/supabase.ts)
-- ===============================================
/* ts
  // New fields to add to the Listing interface
  average_rating?: number;               // 0.0–5.0
  total_reviews?: number;
  reviews_1_star?: number;
  reviews_2_star?: number;
  reviews_3_star?: number;
  reviews_4_star?: number;
  reviews_5_star?: number;

  price_level?: '$' | '$$' | '$$$' | '$$$$' | null;
  business_status?: 'OPERATIONAL' | 'TEMPORARILY_CLOSED' | 'PERMANENTLY_CLOSED';
  photos_count?: number;
  timezone?: string | null;
  google_place_id?: string | null;

  service_features?: Record<string, unknown>;
  area_service?: boolean;

  phone_secondary?: string | null;
  email_secondary?: string | null;
  employee_count?: number | null;
  google_reviews_link?: string | null;
  google_maps_link?: string | null;
  street_view_url?: string | null;
  borough?: string | null;
  h3_index?: string | null;
  payment_methods?: string[] | null;
  accessibility_features?: string[] | null;
*/

-- ===============================================
-- 5) SUPABASE TYPE GENERATION (CLI)
-- ===============================================
-- Run one of the following and commit the output to src/lib/database.types.ts
-- npx supabase gen types typescript --project-id <YOUR_SUPABASE_PROJECT_REF> --schema public > src/lib/database.types.ts
-- or (local db):
-- npx supabase gen types typescript --schema public --db-url "postgresql://postgres:postgres@localhost:54322/postgres" > src/lib/database.types.ts


