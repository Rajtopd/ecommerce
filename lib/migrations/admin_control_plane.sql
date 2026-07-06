-- Admin control plane: additive migration.
-- New tables for admin-managed storefront content, categories, delivery zones,
-- discounts and admin accounts. No existing data is modified or dropped.

-- 1. Site content: every text/image/json surface on the storefront
CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  content_group text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'json')),
  label text NOT NULL,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Categories (previously a hardcoded constants array)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Delivery zones (previously DUBAI_AREAS constant)
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Discount codes
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  kind text NOT NULL DEFAULT 'percent' CHECK (kind IN ('percent', 'fixed')),
  value integer NOT NULL, -- percent (1-100) or fils for fixed
  min_order_fils integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer, -- null = unlimited
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Admin accounts with roles
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  password_hash text NOT NULL, -- scrypt: salt:hash (hex)
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- 6. Orders: additive columns for refunds and discounts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0;

-- RLS: server routes use the service role; public content is anon-readable.
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY site_content_public_read ON site_content FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY delivery_zones_public_read ON delivery_zones FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- discounts and admin_users: no public policies (service role only)
