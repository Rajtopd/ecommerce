-- ==============================================================================
-- SOUL SISTERS - SUPABASE SQL SCHEMA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------

-- Table: users
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text UNIQUE NOT NULL,
    full_name text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: addresses
CREATE TABLE addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text NOT NULL,
    area text NOT NULL,
    street text NOT NULL,
    building text NOT NULL,
    flat_number text,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Table: products
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    material text,
    care_instructions text,
    category text NOT NULL,
    base_price integer NOT NULL, -- in fils
    sale_price integer, -- in fils
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    images jsonb DEFAULT '[]'::jsonb,
    tags text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: product_variants
CREATE TABLE product_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    size text NOT NULL,
    color text NOT NULL,
    color_hex text,
    sku text UNIQUE NOT NULL,
    stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: orders
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE NOT NULL,
    user_id uuid REFERENCES users(id),
    guest_email text,
    guest_phone text,
    status text DEFAULT 'pending',
    subtotal integer NOT NULL, -- in fils
    vat_amount integer NOT NULL, -- in fils
    shipping_charge integer DEFAULT 0, -- in fils
    total integer NOT NULL, -- in fils
    shipping_address jsonb NOT NULL,
    payment_intent_id text,
    payment_status text DEFAULT 'pending',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: order_items
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    variant_id uuid REFERENCES product_variants(id),
    product_snapshot jsonb NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price integer NOT NULL, -- in fils
    total_price integer NOT NULL, -- in fils
    created_at timestamptz DEFAULT now()
);

-- Table: shipments
CREATE TABLE shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number text,
    courier_name text,
    tracking_url text,
    status text DEFAULT 'pending',
    estimated_delivery date,
    shipped_at timestamptz,
    delivered_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: wishlists
CREATE TABLE wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, product_id)
);


-- ------------------------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);


-- ------------------------------------------------------------------------------
-- 3. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Auto updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto order number function (Dynamic year)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year text;
    next_seq int;
BEGIN
    -- Extract current year dynamically
    current_year := to_char(CURRENT_DATE, 'YYYY');
    
    -- We only set order_number if it hasn't been set yet
    IF NEW.order_number IS NULL THEN
        next_seq := nextval('order_number_seq');
        NEW.order_number := 'SS-' || current_year || '-' || LPAD(next_seq::text, 5, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply order number trigger
CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();


-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Note: The service_role key bypasses RLS by default.
-- So we only need to define policies for authenticated and anon users.

-- users: Users can read and update only their own row
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- addresses: Users can read, insert, update, delete only their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
FOR ALL USING (auth.uid() = user_id);

-- products: Anyone (including unauthenticated) can read active products
CREATE POLICY "Anyone can view active products" ON products
FOR SELECT USING (is_active = true);

-- product_variants: Anyone can read variants of active products
CREATE POLICY "Anyone can view variants of active products" ON product_variants
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_variants.product_id
        AND products.is_active = true
    )
);

-- orders: Users can read own orders, and insert orders
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- order_items: Users can read items belonging to their own orders
CREATE POLICY "Users can view own order items" ON order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);

-- shipments: Users can read shipments for their own orders
CREATE POLICY "Users can view own shipments" ON shipments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = shipments.order_id
        AND orders.user_id = auth.uid()
    )
);

-- wishlists: Users can read, insert, delete only their own wishlist items
CREATE POLICY "Users can manage own wishlists" ON wishlists
FOR ALL USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 5. SEED DATA
-- ------------------------------------------------------------------------------

-- Since IDs are gen_random_uuid(), we will use CTEs to insert and retrieve IDs for variants.
-- Product 1
WITH p1 AS (
    INSERT INTO products (name, slug, category, base_price, is_active, is_featured)
    VALUES ('White Linen Midi Dress', 'white-linen-midi-dress', 'Dresses', 45000, true, true)
    RETURNING id
)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'S', 'White', 'DRESS-WHT-S', 10 FROM p1 UNION ALL
SELECT id, 'M', 'White', 'DRESS-WHT-M', 10 FROM p1 UNION ALL
SELECT id, 'L', 'White', 'DRESS-WHT-L', 10 FROM p1;

-- Product 2
WITH p2 AS (
    INSERT INTO products (name, slug, category, base_price, is_active, is_featured)
    VALUES ('Black Ribbed Co-ord Set', 'black-ribbed-coord-set', 'Co-ords', 62000, true, true)
    RETURNING id
)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'XS', 'Black', 'COORD-BLK-XS', 8 FROM p2 UNION ALL
SELECT id, 'S', 'Black', 'COORD-BLK-S', 8 FROM p2 UNION ALL
SELECT id, 'M', 'Black', 'COORD-BLK-M', 8 FROM p2 UNION ALL
SELECT id, 'L', 'Black', 'COORD-BLK-L', 8 FROM p2;

-- Product 3
WITH p3 AS (
    INSERT INTO products (name, slug, category, base_price, sale_price, is_active, is_featured)
    VALUES ('Blush Satin Blouse', 'blush-satin-blouse', 'Tops', 28000, 22000, true, false)
    RETURNING id
)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'S', 'Blush', 'TOP-BLU-S', 15 FROM p3 UNION ALL
SELECT id, 'M', 'Blush', 'TOP-BLU-M', 15 FROM p3 UNION ALL
SELECT id, 'L', 'Blush', 'TOP-BLU-L', 15 FROM p3;
