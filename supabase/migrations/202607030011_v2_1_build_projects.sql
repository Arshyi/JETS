create table if not exists public.build_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  purpose text not null,
  budget numeric not null default 0,
  country text not null,
  currency text not null,
  preferences jsonb not null default '{}'::jsonb,
  owned_items jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  app_version text not null default '2.1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.build_project_slots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.build_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_id text not null,
  component_id text,
  component_category text,
  component_snapshot jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slot_id)
);

create table if not exists public.build_project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.build_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.build_project_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.build_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists build_projects_user_status_idx
  on public.build_projects (user_id, status, updated_at desc);

create index if not exists build_project_slots_project_idx
  on public.build_project_slots (project_id, slot_id);

create index if not exists build_project_notes_project_idx
  on public.build_project_notes (project_id, created_at desc);

create index if not exists build_project_audit_events_project_idx
  on public.build_project_audit_events (project_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_build_projects_updated_at on public.build_projects;
create trigger set_build_projects_updated_at
before update on public.build_projects
for each row execute function public.set_updated_at();

drop trigger if exists set_build_project_slots_updated_at on public.build_project_slots;
create trigger set_build_project_slots_updated_at
before update on public.build_project_slots
for each row execute function public.set_updated_at();

alter table public.build_projects enable row level security;
alter table public.build_project_slots enable row level security;
alter table public.build_project_notes enable row level security;
alter table public.build_project_audit_events enable row level security;

drop policy if exists "Users can read their build projects" on public.build_projects;
create policy "Users can read their build projects"
on public.build_projects for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their build projects" on public.build_projects;
create policy "Users can insert their build projects"
on public.build_projects for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their build projects" on public.build_projects;
create policy "Users can update their build projects"
on public.build_projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their build projects" on public.build_projects;
create policy "Users can delete their build projects"
on public.build_projects for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their build project slots" on public.build_project_slots;
create policy "Users can read their build project slots"
on public.build_project_slots for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their build project slots" on public.build_project_slots;
create policy "Users can insert their build project slots"
on public.build_project_slots for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.build_projects
    where build_projects.id = project_id
    and build_projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their build project slots" on public.build_project_slots;
create policy "Users can update their build project slots"
on public.build_project_slots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their build project slots" on public.build_project_slots;
create policy "Users can delete their build project slots"
on public.build_project_slots for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their build project notes" on public.build_project_notes;
create policy "Users can read their build project notes"
on public.build_project_notes for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their build project notes" on public.build_project_notes;
create policy "Users can insert their build project notes"
on public.build_project_notes for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.build_projects
    where build_projects.id = project_id
    and build_projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their build project notes" on public.build_project_notes;
create policy "Users can delete their build project notes"
on public.build_project_notes for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their build project audit events" on public.build_project_audit_events;
create policy "Users can read their build project audit events"
on public.build_project_audit_events for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their build project audit events" on public.build_project_audit_events;
create policy "Users can insert their build project audit events"
on public.build_project_audit_events for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.build_projects
    where build_projects.id = project_id
    and build_projects.user_id = auth.uid()
  )
);
