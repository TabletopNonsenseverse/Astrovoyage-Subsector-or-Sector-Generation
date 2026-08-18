create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Sector',
  kind text not null default 'sector' check (kind in ('sector','subsector')),
  data jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sectors enable row level security;

create policy "Users can view own sectors" on public.sectors
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can create own sectors" on public.sectors
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own sectors" on public.sectors
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own sectors" on public.sectors
  for delete to authenticated using (auth.uid() = user_id);
create policy "Anyone can view shared sectors" on public.sectors
  for select to anon, authenticated using (is_public = true);

create index if not exists sectors_user_id_updated_idx
  on public.sectors(user_id, updated_at desc);
create index if not exists sectors_public_idx
  on public.sectors(is_public) where is_public = true;
