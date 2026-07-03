create extension if not exists pgcrypto;

alter table public.build_snapshots
add column if not exists notes text not null default '';

create table if not exists public.decision_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'snapshot_created',
      'snapshot_renamed',
      'snapshot_favorited',
      'snapshot_unfavorited',
      'snapshot_status_changed',
      'snapshot_restored',
      'snapshot_deleted',
      'snapshot_note_updated',
      'build_saved',
      'build_favorited',
      'build_note_updated',
      'history_cleared'
    )
  ),
  subject_type text not null check (
    subject_type in ('build_snapshot', 'hardware_listing', 'build_history')
  ),
  subject_id text,
  subject_title text not null,
  summary text not null,
  note text,
  app_version text not null default '0.9.0',
  metadata jsonb not null default '{}'::jsonb,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists decision_audit_events_user_created_at_idx
on public.decision_audit_events (user_id, created_at desc);

create index if not exists decision_audit_events_user_subject_idx
on public.decision_audit_events (user_id, subject_type, subject_id, created_at desc);

create index if not exists decision_audit_events_user_event_type_idx
on public.decision_audit_events (user_id, event_type, created_at desc);

alter table public.decision_audit_events enable row level security;

drop policy if exists "Users can read their decision audit events" on public.decision_audit_events;
create policy "Users can read their decision audit events"
on public.decision_audit_events for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their decision audit events" on public.decision_audit_events;
create policy "Users can create their decision audit events"
on public.decision_audit_events for insert
with check (auth.uid() = user_id);

comment on table public.decision_audit_events is
'Append-only user decision activity across saved builds, favorites, build history, and Build Generator snapshots.';
