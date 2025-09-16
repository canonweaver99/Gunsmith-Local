-- Admin bypass helper for business_claims policies
-- Depends on: public.is_admin(uid uuid) returning boolean

create or replace function public.admin_bypass_business_claims()
returns boolean
language sql
stable
as $$
  select public.is_admin((select auth.uid()));
$$;


