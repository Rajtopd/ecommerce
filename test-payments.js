const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const m = line.match(/^([^=#\s][^=]*)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
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
