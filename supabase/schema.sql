-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Storage model: a single per-user key/value table that mirrors the
-- localStorage keys the app used before Supabase was wired in (baby-bottles,
-- baby-bottles-history, baby-profile, etc). Each row is scoped to the
-- authenticated user via Row Level Security, so every signed-in user only
-- ever sees their own baby's data.

create table if not exists public.app_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.app_state enable row level security;

create policy "Users can read their own app_state"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own app_state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own app_state"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own app_state"
  on public.app_state for delete
  using (auth.uid() = user_id);
