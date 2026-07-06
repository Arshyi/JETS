create table if not exists public.acquisition_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  marketplace text not null,
  source_id text not null,
  listing_url text,
  title text not null,
  description text not null,
  price_text text not null,
  price_amount numeric,
  currency text not null check (currency in ('AED', 'USD')),
  location text not null,
  condition text not null check (condition in ('excellent', 'good', 'fair', 'broken')),
  seller_notes text,
  image_count integer not null default 0 check (image_count >= 0),
  personal_notes jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  analysis_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'reviewing' check (status in ('reviewing', 'ready', 'archived', 'purchased', 'rejected')),
  readiness text not null,
  confidence text not null,
  detected_platform_id text,
  detected_platform_name text,
  recommendation_preview_score integer not null default 0,
  app_version text not null default '4.1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acquisition_corrections (
  id uuid primary key default gen_random_uuid(),
  acquisition_id uuid not null references public.acquisition_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  field_id text not null check (field_id in ('cpu', 'gpu', 'ram', 'platform', 'price', 'storage')),
  before_value text,
  corrected_value text,
  is_unknown boolean not null default false,
  evidence_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.acquisition_notes (
  id uuid primary key default gen_random_uuid(),
  acquisition_id uuid not null references public.acquisition_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note_type text not null default 'general',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.acquisition_decisions (
  id uuid primary key default gen_random_uuid(),
  acquisition_id uuid not null references public.acquisition_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (
    decision in (
      'saved',
      'updated',
      'archived',
      'purchased',
      'rejected',
      'linked-project',
      'note-added',
      'correction-added',
      'compare-created'
    )
  ),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.acquisition_project_links (
  id uuid primary key default gen_random_uuid(),
  acquisition_id uuid not null references public.acquisition_records(id) on delete cascade,
  project_id uuid references public.build_projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  link_type text not null default 'created-from-acquisition',
  created_at timestamptz not null default now(),
  unique (acquisition_id, project_id)
);

create table if not exists public.acquisition_compare_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  acquisition_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(acquisition_ids) between 2 and 3)
);

create index if not exists acquisition_records_user_status_idx
  on public.acquisition_records (user_id, status, updated_at desc);

create index if not exists acquisition_records_user_marketplace_idx
  on public.acquisition_records (user_id, marketplace, updated_at desc);

create index if not exists acquisition_records_platform_idx
  on public.acquisition_records (detected_platform_id, updated_at desc);

create index if not exists acquisition_corrections_acquisition_idx
  on public.acquisition_corrections (acquisition_id, created_at desc);

create index if not exists acquisition_notes_acquisition_idx
  on public.acquisition_notes (acquisition_id, created_at desc);

create index if not exists acquisition_decisions_acquisition_idx
  on public.acquisition_decisions (acquisition_id, created_at desc);

create index if not exists acquisition_project_links_acquisition_idx
  on public.acquisition_project_links (acquisition_id, created_at desc);

create index if not exists acquisition_project_links_project_idx
  on public.acquisition_project_links (project_id, created_at desc);

create index if not exists acquisition_compare_sets_user_idx
  on public.acquisition_compare_sets (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_acquisition_records_updated_at on public.acquisition_records;
create trigger set_acquisition_records_updated_at
before update on public.acquisition_records
for each row execute function public.set_updated_at();

drop trigger if exists set_acquisition_compare_sets_updated_at on public.acquisition_compare_sets;
create trigger set_acquisition_compare_sets_updated_at
before update on public.acquisition_compare_sets
for each row execute function public.set_updated_at();

alter table public.acquisition_records enable row level security;
alter table public.acquisition_corrections enable row level security;
alter table public.acquisition_notes enable row level security;
alter table public.acquisition_decisions enable row level security;
alter table public.acquisition_project_links enable row level security;
alter table public.acquisition_compare_sets enable row level security;

drop policy if exists "Users can read their acquisition records" on public.acquisition_records;
create policy "Users can read their acquisition records"
on public.acquisition_records for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition records" on public.acquisition_records;
create policy "Users can insert their acquisition records"
on public.acquisition_records for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their acquisition records" on public.acquisition_records;
create policy "Users can update their acquisition records"
on public.acquisition_records for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their acquisition records" on public.acquisition_records;
create policy "Users can delete their acquisition records"
on public.acquisition_records for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their acquisition corrections" on public.acquisition_corrections;
create policy "Users can read their acquisition corrections"
on public.acquisition_corrections for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition corrections" on public.acquisition_corrections;
create policy "Users can insert their acquisition corrections"
on public.acquisition_corrections for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.acquisition_records
    where acquisition_records.id = acquisition_id
    and acquisition_records.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their acquisition corrections" on public.acquisition_corrections;
create policy "Users can update their acquisition corrections"
on public.acquisition_corrections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their acquisition corrections" on public.acquisition_corrections;
create policy "Users can delete their acquisition corrections"
on public.acquisition_corrections for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their acquisition notes" on public.acquisition_notes;
create policy "Users can read their acquisition notes"
on public.acquisition_notes for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition notes" on public.acquisition_notes;
create policy "Users can insert their acquisition notes"
on public.acquisition_notes for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.acquisition_records
    where acquisition_records.id = acquisition_id
    and acquisition_records.user_id = auth.uid()
  )
);

drop policy if exists "Users can read their acquisition decisions" on public.acquisition_decisions;
create policy "Users can read their acquisition decisions"
on public.acquisition_decisions for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition decisions" on public.acquisition_decisions;
create policy "Users can insert their acquisition decisions"
on public.acquisition_decisions for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.acquisition_records
    where acquisition_records.id = acquisition_id
    and acquisition_records.user_id = auth.uid()
  )
);

drop policy if exists "Users can read their acquisition project links" on public.acquisition_project_links;
create policy "Users can read their acquisition project links"
on public.acquisition_project_links for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition project links" on public.acquisition_project_links;
create policy "Users can insert their acquisition project links"
on public.acquisition_project_links for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.acquisition_records
    where acquisition_records.id = acquisition_id
    and acquisition_records.user_id = auth.uid()
  )
  and (
    project_id is null
    or exists (
      select 1 from public.build_projects
      where build_projects.id = project_id
      and build_projects.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can delete their acquisition project links" on public.acquisition_project_links;
create policy "Users can delete their acquisition project links"
on public.acquisition_project_links for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their acquisition compare sets" on public.acquisition_compare_sets;
create policy "Users can read their acquisition compare sets"
on public.acquisition_compare_sets for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their acquisition compare sets" on public.acquisition_compare_sets;
create policy "Users can insert their acquisition compare sets"
on public.acquisition_compare_sets for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their acquisition compare sets" on public.acquisition_compare_sets;
create policy "Users can update their acquisition compare sets"
on public.acquisition_compare_sets for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their acquisition compare sets" on public.acquisition_compare_sets;
create policy "Users can delete their acquisition compare sets"
on public.acquisition_compare_sets for delete
using (auth.uid() = user_id);
