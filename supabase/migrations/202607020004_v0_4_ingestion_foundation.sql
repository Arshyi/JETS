create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.listing_sources (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('marketplace', 'retail', 'local-vendor', 'manual')),
  base_url text,
  location_scope text not null,
  status text not null default 'setup-required' check (status in ('healthy', 'degraded', 'paused', 'setup-required')),
  adapter_mode text not null default 'mock-dry-run' check (adapter_mode in ('mock-dry-run')),
  enabled boolean not null default true,
  compliance_notes text[] not null default '{}',
  rate_limit_notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingested_listings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.listing_sources(id) on delete cascade,
  external_id text not null,
  title text not null,
  description text,
  listing_url text,
  price numeric,
  currency text not null default 'AED',
  location text,
  condition text not null check (condition in ('excellent', 'good', 'fair', 'broken')),
  category text not null,
  form_factor text not null check (form_factor in ('desktop', 'laptop', 'workstation', 'component')),
  recommended_use_cases text[] not null default '{}',
  seller_name text,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  freshness_status text not null check (freshness_status in ('fresh', 'aging', 'stale')),
  duplicate_key text not null,
  risk_signals text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.listing_sources(id) on delete set null,
  status text not null check (status in ('completed', 'warning', 'failed', 'cancelled')),
  mode text not null default 'dry_run' check (mode in ('dry_run')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  listings_seen integer not null default 0 check (listings_seen >= 0),
  listings_normalized integer not null default 0 check (listings_normalized >= 0),
  duplicates_detected integer not null default 0 check (duplicates_detected >= 0),
  stale_listings integer not null default 0 check (stale_listings >= 0),
  errors jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ingested_listings_source_id_idx
on public.ingested_listings (source_id);

create index if not exists ingested_listings_duplicate_key_idx
on public.ingested_listings (duplicate_key);

create index if not exists ingested_listings_freshness_status_idx
on public.ingested_listings (freshness_status);

create index if not exists ingestion_runs_started_at_idx
on public.ingestion_runs (started_at desc);

drop trigger if exists listing_sources_set_updated_at on public.listing_sources;
create trigger listing_sources_set_updated_at
before update on public.listing_sources
for each row execute function public.set_updated_at();

drop trigger if exists ingested_listings_set_updated_at on public.ingested_listings;
create trigger ingested_listings_set_updated_at
before update on public.ingested_listings
for each row execute function public.set_updated_at();

alter table public.listing_sources enable row level security;
alter table public.ingested_listings enable row level security;
alter table public.ingestion_runs enable row level security;

drop policy if exists "Authenticated users can read listing sources" on public.listing_sources;
create policy "Authenticated users can read listing sources"
on public.listing_sources for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read ingested listings" on public.ingested_listings;
create policy "Authenticated users can read ingested listings"
on public.ingested_listings for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read ingestion runs" on public.ingestion_runs;
create policy "Authenticated users can read ingestion runs"
on public.ingestion_runs for select
to authenticated
using (true);

comment on table public.listing_sources is
'Marketplace/source registry for JETS ingestion. v0.4 supports mock-dry-run adapters only.';

comment on table public.ingested_listings is
'Normalized listing records produced by approved ingestion paths. v0.4 stores mock dry-run output only.';

comment on table public.ingestion_runs is
'Operational dry-run logs for ingestion adapters. Writes should come from server-side admin flows or service-role jobs.';
