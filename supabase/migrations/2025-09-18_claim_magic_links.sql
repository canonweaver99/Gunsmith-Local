-- Claim magic links table
create table if not exists public.claim_magic_links (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists claim_magic_links_listing_idx on public.claim_magic_links(listing_id);


