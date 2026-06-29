const { Client } = require('pg')

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:Rajshroff52@@db.hhdfmjamwsvisjyobatk.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    const result = await client.query("SELECT * FROM orders WHERE id = '2f75e77c-eb8e-4719-a61a-1fd018c60686'")
    console.log("Order Data:")
    console.log(JSON.stringify(result.rows[0], null, 2))

    const itemsResult = await client.query("SELECT * FROM order_items WHERE order_id = '2f75e77c-eb8e-4719-a61a-1fd018c60686'")
    console.log("Order Items:")
    console.log(JSON.stringify(itemsResult.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}

run()
