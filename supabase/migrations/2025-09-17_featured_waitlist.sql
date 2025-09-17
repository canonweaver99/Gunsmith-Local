-- Create featured waitlist table for when states are full
begin;

create table if not exists public.featured_waitlist (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  state_code text not null,
  requested_at timestamptz default now(),
  notified_at timestamptz,
  status text default 'waiting' check (status in ('waiting', 'notified', 'converted', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table public.featured_waitlist enable row level security;

create policy "Users can view own waitlist entries"
  on public.featured_waitlist for select
  using (auth.uid() = user_id);

create policy "Users can insert own waitlist entries"
  on public.featured_waitlist for insert
  with check (auth.uid() = user_id and auth.uid() is not null);

create policy "Users can update own waitlist entries"
  on public.featured_waitlist for update
  using (auth.uid() = user_id);

create policy "Admins can manage all waitlist entries"
  on public.featured_waitlist for all
  using (public.is_admin(auth.uid()));

-- Indexes
create index if not exists idx_featured_waitlist_state_status 
  on public.featured_waitlist(state_code, status);

create index if not exists idx_featured_waitlist_user_listing 
  on public.featured_waitlist(user_id, listing_id);

commit;
