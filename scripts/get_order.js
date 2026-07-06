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
    const result = await client.query('SELECT id, order_number FROM orders ORDER BY created_at DESC LIMIT 1')
    if (result.rows.length > 0) {
      console.log(`Latest Order ID: ${result.rows[0].id}`)
      console.log(`Latest Order Number: ${result.rows[0].order_number}`)
    } else {
      console.log('No orders found.')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}

run()
