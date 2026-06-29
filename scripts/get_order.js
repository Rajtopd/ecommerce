const { Client } = require('pg')

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:Rajshroff52@@db.hhdfmjamwsvisjyobatk.supabase.co:5432/postgres",
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
