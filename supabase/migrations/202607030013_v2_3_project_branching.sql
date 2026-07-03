alter table public.build_projects
  add column if not exists parent_project_id uuid references public.build_projects(id) on delete set null,
  add column if not exists root_project_id uuid references public.build_projects(id) on delete set null,
  add column if not exists branch_name text not null default 'main',
  add column if not exists branch_source text not null default 'manual',
  add column if not exists branch_depth integer not null default 0,
  add column if not exists branch_notes text not null default '',
  add column if not exists source_optimization_run_id uuid references public.build_project_optimization_runs(id) on delete set null,
  add column if not exists source_optimization_suggestion_ids uuid[] not null default '{}';

update public.build_projects
set branch_name = 'main'
where branch_name is null or branch_name = '';

alter table public.build_projects
  drop constraint if exists build_projects_branch_source_check;

alter table public.build_projects
  add constraint build_projects_branch_source_check
  check (branch_source in ('manual', 'optimization', 'import'));

create index if not exists build_projects_root_idx
  on public.build_projects (user_id, root_project_id, branch_depth, updated_at desc);

create index if not exists build_projects_parent_idx
  on public.build_projects (user_id, parent_project_id, updated_at desc);

create index if not exists build_projects_optimization_source_idx
  on public.build_projects (source_optimization_run_id);
