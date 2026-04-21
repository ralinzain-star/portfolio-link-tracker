-- ============================================
-- Portfolio Link Tracker — Supabase SQL Schema
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1) links table
create table if not exists public.links (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  company    text not null,
  original_url text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists links_slug_idx on public.links (slug);

-- 2) views table
create table if not exists public.views (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid not null references public.links(id) on delete cascade,
  user_agent text,
  referrer   text,
  ip_hash    text,
  created_at timestamptz not null default now()
);

create index if not exists views_link_id_idx on public.views (link_id);
create index if not exists views_created_at_idx on public.views (created_at desc);

-- 3) Enable RLS
alter table public.links enable row level security;
alter table public.views enable row level security;

-- 4) RLS policies for links
-- Admin (authenticated) can do everything
create policy "Authenticated users can insert links"
  on public.links for insert
  to authenticated
  with check (true);

create policy "Authenticated users can read links"
  on public.links for select
  to authenticated
  using (true);

create policy "Authenticated users can update own links"
  on public.links for update
  to authenticated
  using (created_by = auth.uid());

create policy "Authenticated users can delete own links"
  on public.links for delete
  to authenticated
  using (created_by = auth.uid());

-- Anon can read links (needed for /p/[slug] redirect)
create policy "Anon can read links"
  on public.links for select
  to anon
  using (true);

-- 5) RLS policies for views
-- Anon can insert views (record visits from public)
create policy "Anon can insert views"
  on public.views for insert
  to anon
  with check (true);

-- Authenticated can also insert views
create policy "Authenticated can insert views"
  on public.views for insert
  to authenticated
  with check (true);

-- Only authenticated can read views (admin dashboard)
create policy "Authenticated users can read views"
  on public.views for select
  to authenticated
  using (true);
