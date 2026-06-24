-- =============================================================
-- Pina's Thrift — Vercel Postgres schema
-- =============================================================
-- HOW TO USE:
--   1. In your Vercel project: Storage → Create Database → Postgres
--   2. Open the database → "Query" tab
--   3. Paste this entire file → click "Run query"
-- =============================================================

DROP TABLE IF EXISTS orders   CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users    CASCADE;

CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  mobile      TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Skirt and Blouse','Corporate Outfit','Kids Attire','Gowns')),
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  reference       TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_mobile TEXT,
  customer_email  TEXT,
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  total           NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Processing','Ready to Deliver','Delivered')),
  history         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orders_reference_idx ON orders (LOWER(reference));
CREATE INDEX orders_created_idx   ON orders (created_at DESC);

-- Seed 12 starter products
INSERT INTO products (id, name, category, price, stock, image) VALUES
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

SELECT 'Pina''s Thrift schema installed. ' || COUNT(*) || ' seed products loaded.' AS status FROM products;
