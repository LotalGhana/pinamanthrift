-- =============================================================
-- Pina's Thrift — Supabase database schema
-- =============================================================
-- HOW TO USE:
--   1. Create a free project at https://supabase.com
--   2. Open your project → "SQL Editor" → "+ New query"
--   3. Paste this entire file and click "Run"
--   4. Go to "Project Settings → API" and copy:
--        - Project URL
--        - anon / public key
--      then paste them at the top of app.js
-- =============================================================

-- Clean slate (safe to re-run)
drop table if exists public.orders   cascade;
drop table if exists public.products cascade;
drop table if exists public.users    cascade;

-- ---------- USERS ----------
create table public.users (
  id          text primary key,
  name        text not null,
  email       text not null unique,
  mobile      text not null unique,
  password    text not null,
  created_at  timestamptz default now()
);

-- ---------- PRODUCTS ----------
create table public.products (
  id          text primary key default ('p_' || extract(epoch from now())::bigint::text),
  name        text not null,
  category    text not null check (category in ('Skirt and Blouse','Corporate Outfit','Kids Attire','Gowns')),
  price       numeric(10,2) not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  image       text not null,
  created_at  timestamptz default now()
);

-- ---------- ORDERS ----------
create table public.orders (
  id              text primary key,
  reference       text not null,
  customer_name   text not null,
  customer_mobile text,
  customer_email  text,
  items           jsonb not null default '[]'::jsonb,
  total           numeric(10,2) not null,
  status          text not null default 'Pending'
                  check (status in ('Pending','Processing','Ready to Deliver','Delivered')),
  history         jsonb not null default '[]'::jsonb,
  created_at      timestamptz default now()
);

-- Helpful indexes
create index orders_reference_idx on public.orders (lower(reference));
create index orders_created_idx   on public.orders (created_at desc);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
-- The site uses your project's "anon" public key directly in the
-- browser, so we must enable RLS and add policies that allow the
-- exact operations the frontend needs.
-- For a hobby/demo store this is fine. For a real production app,
-- you should switch admin actions to Supabase Auth + a service role.
-- =============================================================

alter table public.users    enable row level security;
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- USERS: allow signup (insert) + login lookup (select)
create policy "users read"   on public.users   for select using (true);
create policy "users insert" on public.users   for insert with check (true);
create policy "users update" on public.users   for update using (true) with check (true);

-- PRODUCTS: everyone can read, admin actions (insert/update/delete) allowed
create policy "products read"   on public.products for select using (true);
create policy "products insert" on public.products for insert with check (true);
create policy "products update" on public.products for update using (true) with check (true);
create policy "products delete" on public.products for delete using (true);

-- ORDERS: customers create + read their own (by id/reference), admin manages
create policy "orders read"   on public.orders for select using (true);
create policy "orders insert" on public.orders for insert with check (true);
create policy "orders update" on public.orders for update using (true) with check (true);

-- =============================================================
-- SEED PRODUCTS (initial 12 items)
-- =============================================================
insert into public.products (id, name, category, price, stock, image) values
('p1',  'Floral Midi Skirt & Silk Blouse Set', 'Skirt and Blouse', 180, 6,  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80'),
('p2',  'Pleated Pastel Skirt + White Top',    'Skirt and Blouse', 150, 4,  'https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=600&q=80'),
('p3',  'Boho Print Wrap Skirt Set',           'Skirt and Blouse', 165, 3,  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'),
('p4',  'Classic Navy Blazer Suit',            'Corporate Outfit', 320, 5,  'https://images.unsplash.com/photo-1632149877166-f75d49000351?w=600&q=80'),
('p5',  'Beige Pencil Skirt & Jacket',         'Corporate Outfit', 280, 4,  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80'),
('p6',  'Charcoal Power Suit',                 'Corporate Outfit', 350, 2,  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'),
('p7',  'Pink Princess Party Dress',           'Kids Attire',       95, 8,  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80'),
('p8',  'Little Girl Denim Set',               'Kids Attire',       85, 7,  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80'),
('p9',  'Floral Toddler Sunday Dress',         'Kids Attire',       70, 10, 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80'),
('p10', 'Emerald Satin Evening Gown',          'Gowns',            420, 3,  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80'),
('p11', 'Rose Lace Wedding Gown',              'Gowns',            550, 2,  'https://images.unsplash.com/photo-1594552072238-5c4a26f10f6f?w=600&q=80'),
('p12', 'Champagne A-Line Gown',               'Gowns',            380, 4,  'https://images.unsplash.com/photo-1546961342-1c7d4e8b9b85?w=600&q=80');

-- Done!
select 'Pina''s Thrift schema installed. ' || count(*) || ' seed products loaded.' as status
from public.products;
