CREATE OR REPLACE FUNCTION increment_stock(
  variant_id uuid,
  quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + quantity,
      updated_at = now()
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;
