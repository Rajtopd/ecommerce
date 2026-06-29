const { Client } = require('pg')

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:Rajshroff52@@db.hhdfmjamwsvisjyobatk.supabase.co:5432/postgres",
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
