alter table public.build_projects
  add column if not exists strategy_id text,
  add column if not exists strategy_title text,
  add column if not exists strategy_snapshot jsonb not null default '{}'::jsonb;

do $$
begin
  alter table public.build_projects
    add constraint build_projects_strategy_id_check
    check (
      strategy_id is null or
      strategy_id in (
        'upgrade-existing-machine',
        'buy-used-workstation',
        'build-from-scratch',
        'laptop-egpu',
        'mini-pc',
        'server-conversion',
        'repair-existing-hardware',
        'wait-for-better-value',
        'hybrid-strategy'
      )
    );
exception
  when duplicate_object then null;
end $$;

create index if not exists build_projects_user_strategy_idx
  on public.build_projects (user_id, strategy_id, updated_at desc)
  where strategy_id is not null;

comment on column public.build_projects.strategy_id is
  'Deterministic strategy type that originally created or framed this project.';

comment on column public.build_projects.strategy_title is
  'Human-readable strategy title captured when the project was created.';

comment on column public.build_projects.strategy_snapshot is
  'Full deterministic strategy recommendation snapshot used to create the project.';
