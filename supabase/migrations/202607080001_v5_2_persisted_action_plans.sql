create table if not exists public.action_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  task_key text not null,
  task_type text not null,
  title text not null,
  description text not null default '',
  status text not null default 'recommended',
  priority text not null default 'medium',
  risk text not null default 'medium',
  difficulty text not null default 'Moderate',
  estimated_cost_usd numeric not null default 0,
  estimated_time_minutes integer not null default 0,
  sort_order integer not null default 0,
  is_optional boolean not null default false,
  slot_ids text[] not null default '{}',
  evidence_record_ids text[] not null default '{}',
  resolves_validation_issue_ids text[] not null default '{}',
  playbook_id text,
  playbook_recommendation_id text,
  playbook_recommendation_title text,
  platform_id text,
  platform_name text,
  strategy_id text,
  strategy_title text,
  verification text not null default 'pending-review',
  notes text not null default '',
  task_snapshot jsonb not null default '{}'::jsonb,
  accepted_at timestamptz,
  completed_at timestamptz,
  skipped_at timestamptz,
  rejected_at timestamptz,
  reopened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, task_key)
);

create table if not exists public.action_plan_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  completion_percent integer not null default 0,
  estimated_remaining_cost_usd numeric not null default 0,
  estimated_remaining_time_minutes integer not null default 0,
  platform_improvement_percent integer not null default 0,
  knowledge_coverage_percent integer not null default 0,
  project_maturity_percent integer not null default 0,
  validation_progress_percent integer not null default 0,
  resolved_validation_issue_ids text[] not null default '{}',
  action_plan_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);

create table if not exists public.action_plan_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  task_id uuid references public.action_plan_tasks(id) on delete cascade,
  comment_type text not null default 'note',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.action_plan_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  task_id uuid references public.action_plan_tasks(id) on delete set null,
  event_type text not null,
  summary text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.action_plan_dependencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.build_projects(id) on delete cascade,
  task_id uuid not null references public.action_plan_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.action_plan_tasks(id) on delete cascade,
  dependency_key text not null,
  created_at timestamptz not null default now(),
  unique (task_id, depends_on_task_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'action_plan_tasks_status_check'
  ) then
    alter table public.action_plan_tasks
      add constraint action_plan_tasks_status_check
      check (status in ('recommended', 'accepted', 'skipped', 'rejected', 'completed'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'action_plan_tasks_priority_check'
  ) then
    alter table public.action_plan_tasks
      add constraint action_plan_tasks_priority_check
      check (priority in ('low', 'medium', 'high', 'critical'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'action_plan_tasks_risk_check'
  ) then
    alter table public.action_plan_tasks
      add constraint action_plan_tasks_risk_check
      check (risk in ('low', 'medium', 'high', 'critical'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'action_plan_tasks_difficulty_check'
  ) then
    alter table public.action_plan_tasks
      add constraint action_plan_tasks_difficulty_check
      check (difficulty in ('Easy', 'Moderate', 'Advanced', 'Expert'));
  end if;
end $$;

create index if not exists action_plan_tasks_user_project_status_idx
  on public.action_plan_tasks (user_id, project_id, status, sort_order);

create index if not exists action_plan_tasks_project_key_idx
  on public.action_plan_tasks (project_id, task_key);

create index if not exists action_plan_progress_user_project_idx
  on public.action_plan_progress (user_id, project_id);

create index if not exists action_plan_comments_project_task_idx
  on public.action_plan_comments (user_id, project_id, task_id, created_at desc);

create index if not exists action_plan_audit_events_project_created_idx
  on public.action_plan_audit_events (user_id, project_id, created_at desc);

create index if not exists action_plan_dependencies_project_task_idx
  on public.action_plan_dependencies (user_id, project_id, task_id);

drop trigger if exists set_action_plan_tasks_updated_at on public.action_plan_tasks;
create trigger set_action_plan_tasks_updated_at
before update on public.action_plan_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_action_plan_progress_updated_at on public.action_plan_progress;
create trigger set_action_plan_progress_updated_at
before update on public.action_plan_progress
for each row execute function public.set_updated_at();

alter table public.action_plan_tasks enable row level security;
alter table public.action_plan_progress enable row level security;
alter table public.action_plan_comments enable row level security;
alter table public.action_plan_audit_events enable row level security;
alter table public.action_plan_dependencies enable row level security;

create policy "Users can read their action plan tasks"
  on public.action_plan_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their action plan tasks"
  on public.action_plan_tasks
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.build_projects project
      where project.id = project_id and project.user_id = auth.uid()
    )
  );

create policy "Users can update their action plan tasks"
  on public.action_plan_tasks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their action plan tasks"
  on public.action_plan_tasks
  for delete
  using (auth.uid() = user_id);

create policy "Users can read their action plan progress"
  on public.action_plan_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their action plan progress"
  on public.action_plan_progress
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.build_projects project
      where project.id = project_id and project.user_id = auth.uid()
    )
  );

create policy "Users can update their action plan progress"
  on public.action_plan_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their action plan comments"
  on public.action_plan_comments
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their action plan comments"
  on public.action_plan_comments
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.build_projects project
      where project.id = project_id and project.user_id = auth.uid()
    )
  );

create policy "Users can read their action plan audit events"
  on public.action_plan_audit_events
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their action plan audit events"
  on public.action_plan_audit_events
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.build_projects project
      where project.id = project_id and project.user_id = auth.uid()
    )
  );

create policy "Users can read their action plan dependencies"
  on public.action_plan_dependencies
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their action plan dependencies"
  on public.action_plan_dependencies
  for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.build_projects project
      where project.id = project_id and project.user_id = auth.uid()
    )
  );

create policy "Users can delete their action plan dependencies"
  on public.action_plan_dependencies
  for delete
  using (auth.uid() = user_id);

comment on table public.action_plan_tasks is
  'Persisted engineering workflow task state generated from deterministic Action Plans.';

comment on table public.action_plan_progress is
  'Per-project Action Plan progress snapshot for cross-device dashboards and validation impact.';

comment on table public.action_plan_audit_events is
  'Auditable task transition history for accepted, completed, skipped, reopened, and rejected work.';
