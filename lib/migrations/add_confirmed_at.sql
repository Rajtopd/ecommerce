ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
