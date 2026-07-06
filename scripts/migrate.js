const { Client } = require('pg')
const fs = require('fs')

function loadDatabaseUrl() {
  const env = fs.readFileSync('.env.local', 'utf8')
  const match = env.match(/^DATABASE_URL=(.*)$/m)
  if (!match) throw new Error('DATABASE_URL not found in .env.local')
  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

async function run() {
  const client = new Client({
    connectionString: loadDatabaseUrl(),
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    
    console.log('Running add_confirmed_at.sql...')
    const sql1 = fs.readFileSync('lib/migrations/add_confirmed_at.sql', 'utf8')
    await client.query(sql1)
    
    console.log('Running decrement_stock.sql...')
    const sql2 = fs.readFileSync('lib/decrement_stock.sql', 'utf8')
    await client.query(sql2)

    console.log('Running add_rls_policies.sql...')
    const sql3 = fs.readFileSync('lib/migrations/add_rls_policies.sql', 'utf8')
    await client.query(sql3)

    console.log('Migration successful!')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await client.end()
  }
}

run()
