-- JETS v3.3 listing intelligence and human review.
-- This migration is additive and does not implement live scraping, browser automation,
-- OCR, marketplace APIs, AI extraction, or checkout.

create extension if not exists pgcrypto;

create table if not exists public.normalized_marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  listing_key text not null unique,
  source_kind text not null default 'manual-entry' check (
    source_kind in (
      'demo-fixture',
      'manual-entry',
      'future-scraper',
      'future-browser-extension',
      'future-csv-import',
      'future-marketplace-api',
      'future-ocr',
      'future-ai-extraction'
    )
  ),
  marketplace text not null,
  marketplace_listing_id text not null,
  source_url text,
  raw_title text not null,
  raw_description text not null,
  price numeric(12, 2),
  currency text not null default 'AED',
  location text,
  seller text,
  condition text,
  image_urls text[] not null default '{}',
  normalized_platform_id text,
  detected_components jsonb not null default '{}'::jsonb,
  evidence_record_ids uuid[] not null default '{}',
  parsing_confidence text not null default 'medium' check (
    parsing_confidence in ('low', 'medium', 'high', 'very-high')
  ),
  listing_health_score integer not null default 0 check (listing_health_score between 0 and 100),
  listing_health jsonb not null default '{}'::jsonb,
  listing_status text not null default 'needs-review' check (
    listing_status in (
      'active',
      'needs-review',
      'ready-for-recommendation',
      'hidden',
      'archived'
    )
  ),
  recommendation_readiness text not null default 'needs-review' check (
    recommendation_readiness in ('ready', 'needs-review', 'not-ready')
  ),
  readiness_reasons text[] not null default '{}',
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'disputed',
      'deprecated',
      'superseded',
      'archived'
    )
  ),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  app_version text not null default '3.3.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (marketplace, marketplace_listing_id)
);

create table if not exists public.listing_parsed_fields (
  id uuid primary key default gen_random_uuid(),
  normalized_listing_id uuid not null references public.normalized_marketplace_listings(id) on delete cascade,
  field_path text not null,
  field_label text not null,
  parsed_value text,
  corrected_value text,
  final_value text,
  confidence text not null default 'medium' check (
    confidence in ('low', 'medium', 'high', 'very-high')
  ),
  field_source text not null default 'listing-description',
  evidence_record_ids uuid[] not null default '{}',
  review_status text not null default 'pending-review' check (
    review_status in ('pending-review', 'accepted', 'rejected', 'corrected', 'unknown')
  ),
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'disputed',
      'deprecated',
      'superseded',
      'archived'
    )
  ),
  correction_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_listing_id, field_path)
);

create table if not exists public.listing_field_corrections (
  id uuid primary key default gen_random_uuid(),
  normalized_listing_id uuid not null references public.normalized_marketplace_listings(id) on delete cascade,
  parsed_field_id uuid references public.listing_parsed_fields(id) on delete set null,
  field_path text not null,
  before_value text,
  after_value text,
  reason text not null,
  evidence_record_id uuid references public.evidence_records(id) on delete set null,
  status text not null default 'pending-review' check (
    status in (
      'unverified',
      'pending-review',
      'verified',
      'disputed',
      'deprecated',
      'superseded',
      'archived'
    )
  ),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.listing_duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  normalized_listing_id uuid not null references public.normalized_marketplace_listings(id) on delete cascade,
  candidate_listing_id uuid references public.normalized_marketplace_listings(id) on delete cascade,
  candidate_listing_key text,
  status text not null default 'possible-duplicate' check (
    status in ('likely-duplicate', 'possible-duplicate', 'distinct')
  ),
  confidence text not null default 'medium' check (
    confidence in ('low', 'medium', 'high', 'very-high')
  ),
  signals jsonb not null default '[]'::jsonb,
  review_status text not null default 'pending-review' check (
    review_status in ('pending-review', 'accepted', 'rejected', 'corrected', 'unknown')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  created_at timestamptz not null default now(),
  unique (normalized_listing_id, candidate_listing_key)
);

create table if not exists public.listing_review_events (
  id uuid primary key default gen_random_uuid(),
  normalized_listing_id uuid references public.normalized_marketplace_listings(id) on delete cascade,
  parsed_field_id uuid references public.listing_parsed_fields(id) on delete set null,
  correction_id uuid references public.listing_field_corrections(id) on delete set null,
  action text not null,
  summary text not null,
  reason text,
  before_state jsonb,
  after_state jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists normalized_marketplace_listings_status_idx
  on public.normalized_marketplace_listings (verification_status, listing_status, updated_at desc);

create index if not exists normalized_marketplace_listings_marketplace_idx
  on public.normalized_marketplace_listings (marketplace, marketplace_listing_id);

create index if not exists normalized_marketplace_listings_platform_idx
  on public.normalized_marketplace_listings (normalized_platform_id, recommendation_readiness);

create index if not exists normalized_marketplace_listings_submitter_idx
  on public.normalized_marketplace_listings (submitted_by, created_at desc);

create index if not exists listing_parsed_fields_listing_idx
  on public.listing_parsed_fields (normalized_listing_id, review_status);

create index if not exists listing_parsed_fields_path_idx
  on public.listing_parsed_fields (field_path, verification_status);

create index if not exists listing_field_corrections_listing_idx
  on public.listing_field_corrections (normalized_listing_id, created_at desc);

create index if not exists listing_field_corrections_evidence_idx
  on public.listing_field_corrections (evidence_record_id);

create index if not exists listing_duplicate_candidates_listing_idx
  on public.listing_duplicate_candidates (normalized_listing_id, status);

create index if not exists listing_review_events_listing_idx
  on public.listing_review_events (normalized_listing_id, created_at desc);

drop trigger if exists set_normalized_marketplace_listings_updated_at on public.normalized_marketplace_listings;
create trigger set_normalized_marketplace_listings_updated_at
before update on public.normalized_marketplace_listings
for each row execute function public.set_updated_at();

drop trigger if exists set_listing_parsed_fields_updated_at on public.listing_parsed_fields;
create trigger set_listing_parsed_fields_updated_at
before update on public.listing_parsed_fields
for each row execute function public.set_updated_at();

alter table public.normalized_marketplace_listings enable row level security;
alter table public.listing_parsed_fields enable row level security;
alter table public.listing_field_corrections enable row level security;
alter table public.listing_duplicate_candidates enable row level security;
alter table public.listing_review_events enable row level security;

drop policy if exists "Users can read visible normalized listings" on public.normalized_marketplace_listings;
create policy "Users can read visible normalized listings"
on public.normalized_marketplace_listings for select
using (
  public.is_evidence_moderator()
  or submitted_by = auth.uid()
  or (
    visibility = 'public'
    and verification_status in ('verified', 'disputed', 'deprecated', 'superseded', 'archived')
  )
);

drop policy if exists "Users can submit pending normalized listings" on public.normalized_marketplace_listings;
create policy "Users can submit pending normalized listings"
on public.normalized_marketplace_listings for insert
with check (
  auth.uid() = submitted_by
  and source_kind in ('manual-entry', 'demo-fixture')
  and verification_status in ('unverified', 'pending-review')
  and reviewed_by is null
);

drop policy if exists "Moderators can update normalized listings" on public.normalized_marketplace_listings;
create policy "Moderators can update normalized listings"
on public.normalized_marketplace_listings for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Users can read parsed fields for visible listings" on public.listing_parsed_fields;
create policy "Users can read parsed fields for visible listings"
on public.listing_parsed_fields for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.normalized_marketplace_listings listing
    where listing.id = listing_parsed_fields.normalized_listing_id
      and (
        listing.submitted_by = auth.uid()
        or (
          listing.visibility = 'public'
          and listing.verification_status in ('verified', 'disputed', 'deprecated', 'superseded', 'archived')
        )
      )
  )
);

drop policy if exists "Users can create pending parsed fields for own listings" on public.listing_parsed_fields;
create policy "Users can create pending parsed fields for own listings"
on public.listing_parsed_fields for insert
with check (
  auth.uid() = created_by
  and review_status = 'pending-review'
  and exists (
    select 1
    from public.normalized_marketplace_listings listing
    where listing.id = listing_parsed_fields.normalized_listing_id
      and listing.submitted_by = auth.uid()
  )
);

drop policy if exists "Moderators can update parsed listing fields" on public.listing_parsed_fields;
create policy "Moderators can update parsed listing fields"
on public.listing_parsed_fields for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Users can read visible listing corrections" on public.listing_field_corrections;
create policy "Users can read visible listing corrections"
on public.listing_field_corrections for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.normalized_marketplace_listings listing
    where listing.id = listing_field_corrections.normalized_listing_id
      and listing.visibility = 'public'
      and listing.verification_status in ('verified', 'disputed', 'deprecated', 'superseded', 'archived')
  )
);

drop policy if exists "Users can submit pending listing corrections" on public.listing_field_corrections;
create policy "Users can submit pending listing corrections"
on public.listing_field_corrections for insert
with check (
  auth.uid() = created_by
  and status in ('unverified', 'pending-review')
);

drop policy if exists "Moderators can update listing corrections" on public.listing_field_corrections;
create policy "Moderators can update listing corrections"
on public.listing_field_corrections for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Users can read visible duplicate candidates" on public.listing_duplicate_candidates;
create policy "Users can read visible duplicate candidates"
on public.listing_duplicate_candidates for select
using (
  public.is_evidence_moderator()
  or exists (
    select 1
    from public.normalized_marketplace_listings listing
    where listing.id = listing_duplicate_candidates.normalized_listing_id
      and (
        listing.submitted_by = auth.uid()
        or (
          listing.visibility = 'public'
          and listing.verification_status in ('verified', 'disputed', 'deprecated', 'superseded', 'archived')
        )
      )
  )
);

drop policy if exists "Moderators can manage duplicate candidates" on public.listing_duplicate_candidates;
create policy "Moderators can manage duplicate candidates"
on public.listing_duplicate_candidates for all
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Users can read visible listing review events" on public.listing_review_events;
create policy "Users can read visible listing review events"
on public.listing_review_events for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.normalized_marketplace_listings listing
    where listing.id = listing_review_events.normalized_listing_id
      and (
        listing.submitted_by = auth.uid()
        or (
          listing.visibility = 'public'
          and listing.verification_status in ('verified', 'disputed', 'deprecated', 'superseded', 'archived')
        )
      )
  )
);

drop policy if exists "Users can create listing review events" on public.listing_review_events;
create policy "Users can create listing review events"
on public.listing_review_events for insert
with check (
  public.is_evidence_moderator()
  or created_by = auth.uid()
);

comment on table public.normalized_marketplace_listings is
'Persistent listing intelligence records for reviewed raw marketplace/manual listing snapshots. Producers may be demo fixtures, manual entry, future scrapers, future browser extension, future CSV, future APIs, OCR, or AI extraction.';

comment on table public.listing_parsed_fields is
'Every parsed listing field is reviewable, correctable, and linkable to evidence before it influences recommendations.';

comment on table public.listing_field_corrections is
'Human corrections preserve before/after values, reason, reviewer, and optional evidence record.';

comment on table public.listing_duplicate_candidates is
'Deterministic duplicate candidates preserve duplicate signals for human review.';
