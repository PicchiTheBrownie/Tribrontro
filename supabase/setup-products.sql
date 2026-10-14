-- supabase/setup-products.sql
-- Run this ONCE in Supabase: SQL Editor > New query > paste > Run.
-- It is safe to run again. It prepares the "products" table and photo storage for the admin panel.
--
-- BEFORE you run it, make sure your admin email is in the "admins" table (Table editor > admins),
-- because only emails listed there can add, edit or delete products and photos.
-- If you have no admins table yet, uncomment the two lines in step 1, put YOUR email, and run.

-- 1) Who is an admin ------------------------------------------------------------
create table if not exists public.admins (
  id    uuid primary key default gen_random_uuid(),
  email text unique not null,
  role  text not null default 'staff'
);
-- insert into public.admins (email, role) values ('you@example.com', 'admin') on conflict (email) do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Product columns ------------------------------------------------------------
alter table public.products
  add column if not exists description text,
  add column if not exists sizes       text[] not null default '{}',
  add column if not exists colors      text[] not null default '{}',
  add column if not exists color_hex   jsonb  not null default '{}'::jsonb,
  add column if not exists tags        text[] not null default '{}',
  add column if not exists tex         int    not null default 1,
  add column if not exists img         text,
  add column if not exists img_back    text,
  add column if not exists active      boolean not null default true;

-- 3) Who can read / change products --------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (active is not false);

drop policy if exists "products admin all" on public.products;
create policy "products admin all" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4) Photo storage --------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- IMPORTANT: customers also sign in (customer accounts), so they are "authenticated" too.
-- If you created an older policy on "products" or on storage that lets ANY signed-in user write
-- (Authentication > Policies), delete it. Only the admin policies above should allow writes.
