-- JETS v3.2 evidence review persistence.
-- This migration is additive and does not enable live scraping, OCR, AI, or marketplace APIs.

create extension if not exists pgcrypto;

create or replace function public.is_evidence_moderator()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'moderator')
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'moderator')
    or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['admin', 'moderator'],
    false
  );
$$;

create table if not exists public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_type text not null check (
    source_type in (
      'official-documentation',
      'manufacturer-specification',
      'service-manual',
      'community-discovery',
      'forum',
      'video',
      'benchmark',
      'moderator-verified',
      'user-submission',
      'manual-research',
      'future-ai-extraction',
      'future-ocr',
      'future-scraper'
    )
  ),
  title text not null,
  publisher text,
  url text,
  trust_weight integer not null default 40 check (trust_weight between 0 and 100),
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'deprecated',
      'disputed',
      'superseded',
      'archived'
    )
  ),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.evidence_sources(id) on delete set null,
  subject_type text not null check (
    subject_type in (
      'platform-profile',
      'platform-specification',
      'platform-constraint',
      'platform-knowledge-card',
      'upgrade-opportunity',
      'adapter-intelligence',
      'marketplace-parsed-field',
      'solution-intelligence-finding',
      'compatibility-rule',
      'community-discovery'
    )
  ),
  subject_id text not null,
  platform_id text,
  claim text not null,
  source_type text not null check (
    source_type in (
      'official-documentation',
      'manufacturer-specification',
      'service-manual',
      'community-discovery',
      'forum',
      'video',
      'benchmark',
      'moderator-verified',
      'user-submission',
      'manual-research',
      'future-ai-extraction',
      'future-ocr',
      'future-scraper'
    )
  ),
  source_title text not null,
  source_url text,
  confidence text not null default 'medium' check (
    confidence in ('low', 'medium', 'high', 'very-high')
  ),
  extraction_method text not null default 'manual-curation' check (
    extraction_method in (
      'manual-curation',
      'deterministic-parser',
      'structured-spec-entry',
      'community-report',
      'moderator-review',
      'csv-import',
      'api-import',
      'future-ai-extraction',
      'future-ocr',
      'future-scraper'
    )
  ),
  supporting_text text not null,
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'deprecated',
      'disputed',
      'superseded',
      'archived'
    )
  ),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  app_version text not null default '3.2.0',
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  supersedes_evidence_id uuid references public.evidence_records(id) on delete set null,
  related_evidence_ids uuid[] not null default '{}',
  related_discovery_ids text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_conflicts (
  id uuid primary key default gen_random_uuid(),
  platform_id text,
  claim_id text not null,
  title text not null,
  summary text not null,
  current_handling text not null,
  status text not null default 'needs-review' check (
    status in ('open', 'needs-review', 'resolved', 'accepted-with-warning')
  ),
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'deprecated',
      'disputed',
      'superseded',
      'archived'
    )
  ),
  conflicting_evidence_ids uuid[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_timeline_events (
  id uuid primary key default gen_random_uuid(),
  platform_id text not null,
  date_label text not null,
  title text not null,
  description text not null,
  evidence_record_ids uuid[] not null default '{}',
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'deprecated',
      'disputed',
      'superseded',
      'archived'
    )
  ),
  app_version text not null default '3.2.0',
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_review_notes (
  id uuid primary key default gen_random_uuid(),
  evidence_record_id uuid references public.evidence_records(id) on delete cascade,
  conflict_id uuid references public.evidence_conflicts(id) on delete cascade,
  timeline_event_id uuid references public.evidence_timeline_events(id) on delete cascade,
  action text not null,
  note text not null,
  reason text,
  before_state jsonb,
  after_state jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    evidence_record_id is not null
    or conflict_id is not null
    or timeline_event_id is not null
  )
);

create table if not exists public.parsed_field_evidence_links (
  id uuid primary key default gen_random_uuid(),
  normalized_listing_id text not null,
  source_id text,
  field_path text not null,
  subject_type text not null,
  subject_id text not null,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  confidence text not null default 'medium' check (
    confidence in ('low', 'medium', 'high', 'very-high')
  ),
  extraction_method text not null default 'deterministic-parser' check (
    extraction_method in (
      'manual-curation',
      'deterministic-parser',
      'structured-spec-entry',
      'community-report',
      'moderator-review',
      'csv-import',
      'api-import',
      'future-ai-extraction',
      'future-ocr',
      'future-scraper'
    )
  ),
  verification_status text not null default 'pending-review' check (
    verification_status in (
      'unverified',
      'pending-review',
      'verified',
      'deprecated',
      'disputed',
      'superseded',
      'archived'
    )
  ),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (normalized_listing_id, field_path, evidence_record_id)
);

create index if not exists evidence_sources_status_type_idx
  on public.evidence_sources (verification_status, source_type, updated_at desc);

create index if not exists evidence_sources_submitted_by_idx
  on public.evidence_sources (submitted_by, created_at desc);

create index if not exists evidence_records_status_created_idx
  on public.evidence_records (verification_status, created_at desc);

create index if not exists evidence_records_subject_idx
  on public.evidence_records (subject_type, subject_id, updated_at desc);

create index if not exists evidence_records_platform_idx
  on public.evidence_records (platform_id, verification_status, updated_at desc);

create index if not exists evidence_records_submitted_by_idx
  on public.evidence_records (submitted_by, created_at desc);

create index if not exists evidence_conflicts_platform_status_idx
  on public.evidence_conflicts (platform_id, status, updated_at desc);

create index if not exists evidence_timeline_events_platform_idx
  on public.evidence_timeline_events (platform_id, created_at desc);

create index if not exists evidence_review_notes_record_idx
  on public.evidence_review_notes (evidence_record_id, created_at desc);

create index if not exists evidence_review_notes_conflict_idx
  on public.evidence_review_notes (conflict_id, created_at desc);

create index if not exists parsed_field_evidence_links_listing_idx
  on public.parsed_field_evidence_links (normalized_listing_id, field_path);

create index if not exists parsed_field_evidence_links_evidence_idx
  on public.parsed_field_evidence_links (evidence_record_id);

drop trigger if exists set_evidence_sources_updated_at on public.evidence_sources;
create trigger set_evidence_sources_updated_at
before update on public.evidence_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_evidence_records_updated_at on public.evidence_records;
create trigger set_evidence_records_updated_at
before update on public.evidence_records
for each row execute function public.set_updated_at();

drop trigger if exists set_evidence_conflicts_updated_at on public.evidence_conflicts;
create trigger set_evidence_conflicts_updated_at
before update on public.evidence_conflicts
for each row execute function public.set_updated_at();

drop trigger if exists set_evidence_timeline_events_updated_at on public.evidence_timeline_events;
create trigger set_evidence_timeline_events_updated_at
before update on public.evidence_timeline_events
for each row execute function public.set_updated_at();

alter table public.evidence_sources enable row level security;
alter table public.evidence_records enable row level security;
alter table public.evidence_conflicts enable row level security;
alter table public.evidence_timeline_events enable row level security;
alter table public.evidence_review_notes enable row level security;
alter table public.parsed_field_evidence_links enable row level security;

drop policy if exists "Anyone can read public reviewed evidence sources" on public.evidence_sources;
create policy "Anyone can read public reviewed evidence sources"
on public.evidence_sources for select
using (
  public.is_evidence_moderator()
  or submitted_by = auth.uid()
  or (
    visibility = 'public'
    and verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
  )
);

drop policy if exists "Users can submit pending evidence sources" on public.evidence_sources;
create policy "Users can submit pending evidence sources"
on public.evidence_sources for insert
with check (
  auth.uid() = submitted_by
  and verification_status in ('unverified', 'pending-review')
  and reviewed_by is null
);

drop policy if exists "Moderators can update evidence sources" on public.evidence_sources;
create policy "Moderators can update evidence sources"
on public.evidence_sources for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Anyone can read public reviewed evidence records" on public.evidence_records;
create policy "Anyone can read public reviewed evidence records"
on public.evidence_records for select
using (
  public.is_evidence_moderator()
  or submitted_by = auth.uid()
  or (
    visibility = 'public'
    and verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
  )
);

drop policy if exists "Users can submit pending evidence records" on public.evidence_records;
create policy "Users can submit pending evidence records"
on public.evidence_records for insert
with check (
  auth.uid() = submitted_by
  and verification_status in ('unverified', 'pending-review')
  and reviewed_by is null
);

drop policy if exists "Moderators can update evidence records" on public.evidence_records;
create policy "Moderators can update evidence records"
on public.evidence_records for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Anyone can read reviewed evidence conflicts" on public.evidence_conflicts;
create policy "Anyone can read reviewed evidence conflicts"
on public.evidence_conflicts for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
);

drop policy if exists "Moderators can manage evidence conflicts" on public.evidence_conflicts;
create policy "Moderators can manage evidence conflicts"
on public.evidence_conflicts for all
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Anyone can read reviewed evidence timeline events" on public.evidence_timeline_events;
create policy "Anyone can read reviewed evidence timeline events"
on public.evidence_timeline_events for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
);

drop policy if exists "Moderators can manage evidence timeline events" on public.evidence_timeline_events;
create policy "Moderators can manage evidence timeline events"
on public.evidence_timeline_events for all
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

drop policy if exists "Users can read review notes for visible evidence" on public.evidence_review_notes;
create policy "Users can read review notes for visible evidence"
on public.evidence_review_notes for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.evidence_records record
    where record.id = evidence_review_notes.evidence_record_id
      and (
        record.submitted_by = auth.uid()
        or (
          record.visibility = 'public'
          and record.verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
        )
      )
  )
);

drop policy if exists "Users can add review notes to their own evidence" on public.evidence_review_notes;
create policy "Users can add review notes to their own evidence"
on public.evidence_review_notes for insert
with check (
  public.is_evidence_moderator()
  or created_by = auth.uid()
);

drop policy if exists "Users can read visible parsed field evidence links" on public.parsed_field_evidence_links;
create policy "Users can read visible parsed field evidence links"
on public.parsed_field_evidence_links for select
using (
  public.is_evidence_moderator()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.evidence_records record
    where record.id = parsed_field_evidence_links.evidence_record_id
      and record.visibility = 'public'
      and record.verification_status in ('verified', 'deprecated', 'disputed', 'superseded', 'archived')
  )
);

drop policy if exists "Users can create pending parsed field evidence links" on public.parsed_field_evidence_links;
create policy "Users can create pending parsed field evidence links"
on public.parsed_field_evidence_links for insert
with check (
  auth.uid() = created_by
  and verification_status in ('unverified', 'pending-review')
);

drop policy if exists "Moderators can update parsed field evidence links" on public.parsed_field_evidence_links;
create policy "Moderators can update parsed field evidence links"
on public.parsed_field_evidence_links for update
using (public.is_evidence_moderator())
with check (public.is_evidence_moderator());

comment on table public.evidence_records is
'Evidence records preserve provenance, confidence, extraction method, verification state, audit context, and source metadata for JETS knowledge claims.';

comment on table public.evidence_conflicts is
'Conflicting evidence is preserved for review instead of overwriting platform knowledge.';

comment on table public.parsed_field_evidence_links is
'Links normalized marketplace parser fields to evidence records before parsed facts influence trusted knowledge.';
