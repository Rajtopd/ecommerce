-- Drop restrictive select policies if they exist (optional, or just add new ones)
CREATE POLICY "Anyone can view orders" ON orders
FOR SELECT USING (true);

CREATE POLICY "Anyone can view order items" ON order_items
FOR SELECT USING (true);
