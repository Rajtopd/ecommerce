const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://hhdfmjamwsvisjyobatk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGZtamFtd3N2aXNqeW9iYXRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1OTA4NCwiZXhwIjoyMDk4MTM1MDg0fQ.VEpQ47MfxWGcCk-w6Lg4RNTHBHyAaoNbx6cTNivuWTY'
);
async function run() {
  const { data } = await supabase.from('product_variants').select('id, stock_quantity, products(name)').limit(1);
  if (!data || data.length === 0) {
    console.log("No variants found");
    return;
  }
  const variant = data[0];
  console.log("Found variant:", variant);
  
  const res = await fetch('http://localhost:3001/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ variantId: variant.id, quantity: 1, name: variant.products.name }] })
  });
  const json = await res.json();
  console.log("API Response:", res.status, json);
}
run();
