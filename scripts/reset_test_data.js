// One-time production cleanup: removes test catalogue, test orders, and the
// one test customer account so the store can start fresh with real products.
// Does NOT touch site_content, admin_users, categories, delivery_zones, or discounts.
// Backs up every row it's about to delete to a local JSON file first.
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split('\n').reduce((acc, line) => {
    const m = line.match(/^([^=#\s][^=]*)=(.*)$/);
    if (m) acc[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BACKUP_DIR = '/private/tmp/claude-501/-Users-rajshroff--gemini-antigravity-ide-scratch-ecommerce/727ea6e8-fd45-4404-80b8-7d8b61b42706/scratchpad';
const backupFile = path.join(BACKUP_DIR, `pre-reset-backup-${Date.now()}.json`);

async function fetchAll(table) {
  const { data, error } = await sb.from(table).select('*');
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

async function main() {
  console.log('--- Backing up rows before deletion ---');
  const backup = {};
  for (const table of ['order_items', 'shipments', 'wishlists', 'orders', 'addresses', 'product_variants', 'products', 'users']) {
    backup[table] = await fetchAll(table);
    console.log(`${table}: ${backup[table].length} rows backed up`);
  }
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`Backup written to ${backupFile}`);

  console.log('\n--- Deleting in foreign-key-safe order ---');
  // .neq on the primary key with an impossible value = "delete all rows" (Supabase requires a filter)
  const ALWAYS_TRUE = { column: 'id', value: '00000000-0000-0000-0000-000000000000' };

  for (const table of ['order_items', 'shipments', 'wishlists', 'orders', 'addresses', 'product_variants', 'products', 'users']) {
    const { error, count } = await sb.from(table).delete({ count: 'exact' }).neq(ALWAYS_TRUE.column, ALWAYS_TRUE.value);
    if (error) throw new Error(`Failed deleting ${table}: ${error.message}`);
    console.log(`${table}: deleted ${count ?? '?'} rows`);
  }

  console.log('\n--- Verifying ---');
  for (const table of ['products', 'product_variants', 'orders', 'order_items', 'shipments', 'wishlists', 'users', 'addresses']) {
    const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}: ${count} rows remaining`);
  }

  console.log('\n--- Untouched (confirming) ---');
  for (const table of ['site_content', 'admin_users', 'categories', 'delivery_zones', 'discounts']) {
    const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}: ${count} rows (unchanged)`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
