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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id text not null,
  title text not null,
  snapshot jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create table if not exists public.favorite_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id text not null,
  title text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create table if not exists public.build_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id text not null,
  title text not null,
  action text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_budget_min integer,
  default_budget_max integer,
  default_location text,
  preferred_use_case text,
  preferred_theme text not null default 'system',
  email_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists saved_builds_set_updated_at on public.saved_builds;
create trigger saved_builds_set_updated_at
before update on public.saved_builds
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.saved_builds enable row level security;
alter table public.favorite_builds enable row level security;
alter table public.build_history enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Profiles are visible to their owner" on public.profiles;
create policy "Profiles are visible to their owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can read their saved builds" on public.saved_builds;
create policy "Users can read their saved builds"
on public.saved_builds for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their saved builds" on public.saved_builds;
create policy "Users can create their saved builds"
on public.saved_builds for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their saved builds" on public.saved_builds;
create policy "Users can update their saved builds"
on public.saved_builds for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their saved builds" on public.saved_builds;
create policy "Users can delete their saved builds"
on public.saved_builds for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their favorites" on public.favorite_builds;
create policy "Users can read their favorites"
on public.favorite_builds for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their favorites" on public.favorite_builds;
create policy "Users can create their favorites"
on public.favorite_builds for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their favorites" on public.favorite_builds;
create policy "Users can delete their favorites"
on public.favorite_builds for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their history" on public.build_history;
create policy "Users can read their history"
on public.build_history for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their history" on public.build_history;
create policy "Users can create their history"
on public.build_history for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their history" on public.build_history;
create policy "Users can delete their history"
on public.build_history for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their settings" on public.user_settings;
create policy "Users can read their settings"
on public.user_settings for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their settings" on public.user_settings;
create policy "Users can create their settings"
on public.user_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their settings" on public.user_settings;
create policy "Users can update their settings"
on public.user_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
