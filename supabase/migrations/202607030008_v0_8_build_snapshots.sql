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

create table if not exists public.build_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'reviewing'
    check (status in ('reviewing', 'accepted', 'rejected', 'purchased', 'archived')),
  is_favorite boolean not null default false,
  app_version text not null,
  budget numeric not null check (budget >= 0),
  country text not null,
  currency text not null,
  primary_use_case text not null,
  top_listing_id text not null,
  top_listing_title text not null,
  top_overall_score integer not null check (top_overall_score between 0 and 100),
  top_decision_score integer not null check (top_decision_score between 0 and 100),
  top_compatibility_score integer not null check (top_compatibility_score between 0 and 100),
  platform_health integer not null check (platform_health between 0 and 100),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists build_snapshots_user_created_at_idx
on public.build_snapshots (user_id, created_at desc);

create index if not exists build_snapshots_user_status_idx
on public.build_snapshots (user_id, status);

create index if not exists build_snapshots_user_favorite_idx
on public.build_snapshots (user_id, is_favorite)
where is_favorite = true;

drop trigger if exists build_snapshots_set_updated_at on public.build_snapshots;
create trigger build_snapshots_set_updated_at
before update on public.build_snapshots
for each row execute function public.set_updated_at();

alter table public.build_snapshots enable row level security;

drop policy if exists "Users can read their build snapshots" on public.build_snapshots;
create policy "Users can read their build snapshots"
on public.build_snapshots for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their build snapshots" on public.build_snapshots;
create policy "Users can create their build snapshots"
on public.build_snapshots for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their build snapshots" on public.build_snapshots;
create policy "Users can update their build snapshots"
on public.build_snapshots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their build snapshots" on public.build_snapshots;
create policy "Users can delete their build snapshots"
on public.build_snapshots for delete
using (auth.uid() = user_id);

comment on table public.build_snapshots is
'Versioned Build Generator decision snapshots. Full generator output is preserved in snapshot jsonb while summary columns support fast list and compare views.';
