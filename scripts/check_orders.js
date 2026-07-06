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
    const result = await client.query('SELECT id, order_number, status, payment_status, total FROM orders')
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}

run()
