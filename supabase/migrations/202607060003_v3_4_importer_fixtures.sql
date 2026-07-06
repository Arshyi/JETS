-- JETS v3.4 importer fixture run logs.
-- This migration is additive and does not implement live scraping, browser automation,
-- marketplace APIs, AI extraction, OCR, or checkout.

create extension if not exists pgcrypto;

create table if not exists public.importer_fixture_runs (
  id uuid primary key default gen_random_uuid(),
  fixture_set_id text not null,
  mode text not null default 'dry-run' check (mode in ('dry-run', 'import')),
  status text not null default 'completed' check (
    status in ('completed', 'completed-with-errors', 'failed')
  ),
  fixture_count integer not null default 0 check (fixture_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  summary jsonb not null default '{}'::jsonb,
  app_version text not null default '3.4.0',
  created_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.importer_fixture_run_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.importer_fixture_runs(id) on delete cascade,
  fixture_key text not null,
  marketplace text not null,
  external_id text not null,
  listing_key text,
  normalized_listing_id uuid references public.normalized_marketplace_listings(id) on delete set null,
  status text not null check (
    status in ('created', 'updated', 'skipped', 'error', 'dry-run')
  ),
  error_codes text[] not null default '{}',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists importer_fixture_runs_created_idx
  on public.importer_fixture_runs (created_at desc);

create index if not exists importer_fixture_runs_fixture_set_idx
  on public.importer_fixture_runs (fixture_set_id, mode, created_at desc);

create index if not exists importer_fixture_run_items_run_idx
  on public.importer_fixture_run_items (run_id, status);

create index if not exists importer_fixture_run_items_listing_idx
  on public.importer_fixture_run_items (listing_key);

alter table public.importer_fixture_runs enable row level security;
alter table public.importer_fixture_run_items enable row level security;

drop policy if exists "Moderators can read importer fixture runs" on public.importer_fixture_runs;
create policy "Moderators can read importer fixture runs"
on public.importer_fixture_runs for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
);

drop policy if exists "Moderators can create importer fixture runs" on public.importer_fixture_runs;
create policy "Moderators can create importer fixture runs"
on public.importer_fixture_runs for insert
with check (
  public.is_evidence_moderator()
  or created_by = auth.uid()
);

drop policy if exists "Moderators can read importer fixture run items" on public.importer_fixture_run_items;
create policy "Moderators can read importer fixture run items"
on public.importer_fixture_run_items for select
using (
  public.is_evidence_moderator()
  or exists (
    select 1
    from public.importer_fixture_runs run
    where run.id = importer_fixture_run_items.run_id
      and run.created_by = auth.uid()
  )
);

drop policy if exists "Moderators can create importer fixture run items" on public.importer_fixture_run_items;
create policy "Moderators can create importer fixture run items"
on public.importer_fixture_run_items for insert
with check (
  public.is_evidence_moderator()
  or exists (
    select 1
    from public.importer_fixture_runs run
    where run.id = importer_fixture_run_items.run_id
      and run.created_by = auth.uid()
  )
);

comment on table public.importer_fixture_runs is
'Dry-run and import summaries for deterministic importer fixture seeding into Listing Intelligence.';

comment on table public.importer_fixture_run_items is
'Per-fixture import results, validation errors, created listing links, and seed metadata.';
