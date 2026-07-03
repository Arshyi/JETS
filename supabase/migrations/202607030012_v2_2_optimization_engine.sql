create table if not exists public.build_project_optimization_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.build_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null,
  depth text not null,
  locked_slots text[] not null default '{}',
  input_project_snapshot jsonb not null,
  baseline_score integer not null,
  optimized_score integer not null,
  summary text not null,
  app_version text not null default '2.2.0',
  created_at timestamptz not null default now()
);

create table if not exists public.build_project_optimization_suggestions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.build_project_optimization_runs(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ranking integer not null,
  slot_id text not null,
  action text not null,
  current_component_id text,
  current_component_title text,
  suggested_component_id text,
  suggested_component_title text,
  suggested_component_snapshot jsonb,
  estimated_cost_delta numeric not null default 0,
  score_delta integer not null default 0,
  compatibility_impact integer not null default 0,
  reliability_impact integer not null default 0,
  power_impact integer not null default 0,
  upgradeability_impact integer not null default 0,
  confidence integer not null default 0,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists build_project_optimization_runs_project_idx
  on public.build_project_optimization_runs (project_id, created_at desc);

create index if not exists build_project_optimization_suggestions_run_idx
  on public.build_project_optimization_suggestions (run_id, ranking asc);

alter table public.build_project_optimization_runs enable row level security;
alter table public.build_project_optimization_suggestions enable row level security;

drop policy if exists "Users can read their optimization runs" on public.build_project_optimization_runs;
create policy "Users can read their optimization runs"
on public.build_project_optimization_runs for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their optimization runs" on public.build_project_optimization_runs;
create policy "Users can insert their optimization runs"
on public.build_project_optimization_runs for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.build_projects
    where build_projects.id = project_id
    and build_projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can read their optimization suggestions" on public.build_project_optimization_suggestions;
create policy "Users can read their optimization suggestions"
on public.build_project_optimization_suggestions for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their optimization suggestions" on public.build_project_optimization_suggestions;
create policy "Users can insert their optimization suggestions"
on public.build_project_optimization_suggestions for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.build_project_optimization_runs
    where build_project_optimization_runs.id = run_id
    and build_project_optimization_runs.user_id = auth.uid()
  )
);
