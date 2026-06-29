CREATE OR REPLACE FUNCTION decrement_stock(
  variant_id uuid,
  quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - quantity,
      updated_at = now()
  WHERE id = variant_id
    AND stock_quantity >= quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %',
    variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
