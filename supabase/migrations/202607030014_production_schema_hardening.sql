-- Production hardening for the v0.3 through v2.3 schema.
-- This migration is additive: it does not rewrite historical migrations or remove data.

create index if not exists saved_builds_user_updated_at_idx
  on public.saved_builds (user_id, updated_at desc);

create index if not exists favorite_builds_user_created_at_idx
  on public.favorite_builds (user_id, created_at desc);

create index if not exists build_history_user_created_at_idx
  on public.build_history (user_id, created_at desc);

create index if not exists build_project_slots_user_project_idx
  on public.build_project_slots (user_id, project_id, slot_id);

create index if not exists build_project_notes_user_project_created_at_idx
  on public.build_project_notes (user_id, project_id, created_at desc);

create index if not exists build_project_audit_events_user_project_created_at_idx
  on public.build_project_audit_events (user_id, project_id, created_at desc);

create index if not exists build_project_optimization_runs_user_project_created_at_idx
  on public.build_project_optimization_runs (user_id, project_id, created_at desc);

create index if not exists build_project_optimization_suggestions_user_run_ranking_idx
  on public.build_project_optimization_suggestions (user_id, run_id, ranking asc);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'build_projects_id_user_id_key'
  ) then
    alter table public.build_projects
      add constraint build_projects_id_user_id_key unique (id, user_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_runs_id_project_user_key'
  ) then
    alter table public.build_project_optimization_runs
      add constraint build_project_optimization_runs_id_project_user_key
      unique (id, project_id, user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'saved_builds_nonempty_text_check'
  ) then
    alter table public.saved_builds
      add constraint saved_builds_nonempty_text_check
      check (length(btrim(listing_id)) > 0 and length(btrim(title)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'favorite_builds_nonempty_text_check'
  ) then
    alter table public.favorite_builds
      add constraint favorite_builds_nonempty_text_check
      check (length(btrim(listing_id)) > 0 and length(btrim(title)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_history_action_check'
  ) then
    alter table public.build_history
      add constraint build_history_action_check
      check (action in ('saved_build', 'favorited_build', 'saved_build_snapshot'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_snapshots_nonempty_text_check'
  ) then
    alter table public.build_snapshots
      add constraint build_snapshots_nonempty_text_check
      check (
        length(btrim(title)) > 0
        and length(btrim(country)) > 0
        and length(btrim(currency)) > 0
        and length(btrim(primary_use_case)) > 0
        and length(btrim(top_listing_id)) > 0
        and length(btrim(top_listing_title)) > 0
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_projects_nonempty_text_check'
  ) then
    alter table public.build_projects
      add constraint build_projects_nonempty_text_check
      check (
        length(btrim(title)) > 0
        and length(btrim(purpose)) > 0
        and length(btrim(country)) > 0
        and length(btrim(currency)) > 0
        and length(btrim(branch_name)) > 0
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_projects_branch_depth_check'
  ) then
    alter table public.build_projects
      add constraint build_projects_branch_depth_check
      check (branch_depth >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_slots_slot_id_check'
  ) then
    alter table public.build_project_slots
      add constraint build_project_slots_slot_id_check
      check (
        slot_id in (
          'chassis',
          'motherboard',
          'cpu',
          'cpu-cooler',
          'ram',
          'gpu',
          'psu',
          'storage',
          'operating-system',
          'capture-card',
          'nic',
          'sound-card',
          'wifi',
          'additional-storage',
          'fans',
          'rgb',
          'accessories',
          'laptop-ram-dimm-adapter',
          'egpu-dock',
          'external-psu',
          'thunderbolt-adapter',
          'pcie-adapter',
          'other-adapter'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_slots_component_category_check'
  ) then
    alter table public.build_project_slots
      add constraint build_project_slots_component_category_check
      check (
        component_category is null
        or component_category in (
          'cpu',
          'motherboard',
          'chassis',
          'cpu-cooler',
          'ram',
          'gpu',
          'psu',
          'storage',
          'operating-system',
          'egpu-dock',
          'external-psu',
          'thunderbolt-adapter',
          'pcie-adapter',
          'laptop-ram-dimm-adapter'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_runs_goal_check'
  ) then
    alter table public.build_project_optimization_runs
      add constraint build_project_optimization_runs_goal_check
      check (
        goal in (
          'best-balanced',
          'minimize-cost',
          'maximize-performance',
          'maximize-reliability',
          'minimize-power-draw',
          'maximize-upgradeability',
          'engineering-student'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_runs_depth_check'
  ) then
    alter table public.build_project_optimization_runs
      add constraint build_project_optimization_runs_depth_check
      check (depth in ('standard', 'enthusiast', 'experimental'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_runs_score_check'
  ) then
    alter table public.build_project_optimization_runs
      add constraint build_project_optimization_runs_score_check
      check (
        baseline_score between 0 and 100
        and optimized_score between 0 and 100
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_suggestions_action_check'
  ) then
    alter table public.build_project_optimization_suggestions
      add constraint build_project_optimization_suggestions_action_check
      check (action in ('add', 'keep', 'remove', 'replace', 'reuse'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_suggestions_bounds_check'
  ) then
    alter table public.build_project_optimization_suggestions
      add constraint build_project_optimization_suggestions_bounds_check
      check (
        ranking > 0
        and confidence between 0 and 100
        and score_delta between -100 and 100
        and compatibility_impact between -100 and 100
        and reliability_impact between -100 and 100
        and power_impact between -100 and 100
        and upgradeability_impact between -100 and 100
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ingested_listings_price_seen_check'
  ) then
    alter table public.ingested_listings
      add constraint ingested_listings_price_seen_check
      check (
        (price is null or price >= 0)
        and last_seen_at >= first_seen_at
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ingestion_runs_time_check'
  ) then
    alter table public.ingestion_runs
      add constraint ingestion_runs_time_check
      check (finished_at is null or finished_at >= started_at);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_slots_project_user_fk'
  ) then
    alter table public.build_project_slots
      add constraint build_project_slots_project_user_fk
      foreign key (project_id, user_id)
      references public.build_projects (id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_notes_project_user_fk'
  ) then
    alter table public.build_project_notes
      add constraint build_project_notes_project_user_fk
      foreign key (project_id, user_id)
      references public.build_projects (id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_audit_events_project_user_fk'
  ) then
    alter table public.build_project_audit_events
      add constraint build_project_audit_events_project_user_fk
      foreign key (project_id, user_id)
      references public.build_projects (id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_runs_project_user_fk'
  ) then
    alter table public.build_project_optimization_runs
      add constraint build_project_optimization_runs_project_user_fk
      foreign key (project_id, user_id)
      references public.build_projects (id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_suggestions_project_user_fk'
  ) then
    alter table public.build_project_optimization_suggestions
      add constraint build_project_optimization_suggestions_project_user_fk
      foreign key (project_id, user_id)
      references public.build_projects (id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'build_project_optimization_suggestions_run_project_user_fk'
  ) then
    alter table public.build_project_optimization_suggestions
      add constraint build_project_optimization_suggestions_run_project_user_fk
      foreign key (run_id, project_id, user_id)
      references public.build_project_optimization_runs (id, project_id, user_id)
      on delete cascade;
  end if;
end;
$$;

create or replace function public.ensure_build_project_branch_integrity()
returns trigger
language plpgsql
as $$
begin
  if new.parent_project_id is not null then
    if new.parent_project_id = new.id then
      raise exception 'A build project cannot be its own parent.';
    end if;

    if not exists (
      select 1
      from public.build_projects parent_project
      where parent_project.id = new.parent_project_id
        and parent_project.user_id = new.user_id
    ) then
      raise exception 'Build project parent must belong to the same user.';
    end if;
  end if;

  if new.root_project_id is not null then
    if not exists (
      select 1
      from public.build_projects root_project
      where root_project.id = new.root_project_id
        and root_project.user_id = new.user_id
    ) then
      raise exception 'Build project root must belong to the same user.';
    end if;
  end if;

  if new.source_optimization_run_id is null then
    new.source_optimization_suggestion_ids := '{}';
  else
    if not exists (
      select 1
      from public.build_project_optimization_runs optimization_run
      where optimization_run.id = new.source_optimization_run_id
        and optimization_run.user_id = new.user_id
    ) then
      raise exception 'Source optimization run must belong to the same user.';
    end if;

    if exists (
      select 1
      from unnest(new.source_optimization_suggestion_ids) suggestion_id
      where not exists (
        select 1
        from public.build_project_optimization_suggestions suggestion
        where suggestion.id = suggestion_id
          and suggestion.run_id = new.source_optimization_run_id
          and suggestion.user_id = new.user_id
      )
    ) then
      raise exception 'Source optimization suggestions must belong to the source optimization run.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_build_project_branch_integrity on public.build_projects;
create trigger ensure_build_project_branch_integrity
before insert or update of
  parent_project_id,
  root_project_id,
  source_optimization_run_id,
  source_optimization_suggestion_ids,
  user_id
on public.build_projects
for each row execute function public.ensure_build_project_branch_integrity();

comment on function public.ensure_build_project_branch_integrity() is
'Ensures build project branch, root, and optimization source references stay within the owning user boundary.';
