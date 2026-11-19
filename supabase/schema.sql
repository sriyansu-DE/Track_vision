-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_code text not null unique,
  name text not null,
  college text,
  created_at timestamptz not null default now()
);
create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  status text not null check (status in ('running','completed','disqualified','reset')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms bigint,
  current_checkpoint integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists one_running_race on public.races ((status)) where status='running';
create table if not exists public.checkpoint_events (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races(id) on delete cascade,
  checkpoint_number integer not null,
  occurred_at timestamptz not null default now(),
  device_id text not null default 'esp32',
  created_at timestamptz not null default now(),
  unique(race_id, checkpoint_number)
);
-- Enable Realtime for race and checkpoint changes.
alter publication supabase_realtime add table public.races;
alter publication supabase_realtime add table public.checkpoint_events;
-- API server uses the service role key. Do not expose that key in browser code.
alter table public.teams enable row level security;
alter table public.races enable row level security;
alter table public.checkpoint_events enable row level security;
-- Public read-only policies allow the spectator dashboard to subscribe/read using anon key.
create policy "Public can read teams" on public.teams for select to anon, authenticated using (true);
create policy "Public can read races" on public.races for select to anon, authenticated using (true);
create policy "Public can read checkpoint events" on public.checkpoint_events for select to anon, authenticated using (true);
