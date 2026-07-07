alter table public.acquisition_project_links
  add column if not exists handoff_classification text not null default 'unknown-review-later',
  add column if not exists handoff_status text not null default 'linked',
  add column if not exists slot_mappings jsonb not null default '[]'::jsonb,
  add column if not exists accepted_slot_ids text[] not null default '{}',
  add column if not exists rejected_slot_ids text[] not null default '{}',
  add column if not exists evidence_links jsonb not null default '[]'::jsonb,
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'acquisition_project_links_handoff_classification_check'
  ) then
    alter table public.acquisition_project_links
      add constraint acquisition_project_links_handoff_classification_check
      check (
        handoff_classification in (
          'base-system',
          'full-system',
          'component',
          'adapter-path',
          'parts-donor',
          'unknown-review-later'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'acquisition_project_links_handoff_status_check'
  ) then
    alter table public.acquisition_project_links
      add constraint acquisition_project_links_handoff_status_check
      check (handoff_status in ('linked', 'previewed', 'applied', 'evidence-only'));
  end if;
end $$;

create index if not exists acquisition_project_links_handoff_status_idx
  on public.acquisition_project_links (user_id, handoff_status, created_at desc);

create index if not exists acquisition_project_links_classification_idx
  on public.acquisition_project_links (user_id, handoff_classification, created_at desc);
