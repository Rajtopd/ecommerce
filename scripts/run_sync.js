const { Client } = require('pg')
const fs = require('fs')

async function run() {
  const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
  }, {});

  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Running sync_users.sql...')
    const sql = fs.readFileSync('lib/migrations/sync_users.sql', 'utf8')
    await client.query(sql)
    console.log('Migration successful!')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await client.end()
  }
}
run()
