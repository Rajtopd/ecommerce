const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Simple parser for .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function main() {
  const env = loadEnv();
  
  // Prefer DATABASE_URL or SUPABASE_DB_URL
  const connectionString = env.DATABASE_URL || env.SUPABASE_DB_URL;
  
  if (!connectionString) {
    console.error('Error: DATABASE_URL or SUPABASE_DB_URL is not defined in .env.local');
    console.log('Please add your Supabase connection string to .env.local like:');
    console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/run-sql.js <file-path>       - Runs SQL from a file');
    console.log('  node scripts/run-sql.js "SQL query"       - Runs SQL query directly');
    process.exit(1);
  }

  const target = args[0];
  let sql = '';

  if (fs.existsSync(target)) {
    console.log(`Reading SQL from file: ${target}`);
    sql = fs.readFileSync(target, 'utf8');
  } else {
    sql = target;
  }

  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected successfully. Executing SQL...');
    const res = await client.query(sql);
    console.log('SQL executed successfully.');
    if (res.rows && res.rows.length > 0) {
      console.table(res.rows);
    } else {
      console.log('Result:', res);
    }
  } catch (err) {
    console.error('Error executing SQL:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
