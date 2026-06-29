const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://hhdfmjamwsvisjyobatk.supabase.co'
const supabaseAnonKey = 'sb_publishable_HzVvK-t_uoeelX8niy1tQQ_B4Sus4at'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  console.log('Testing anon key query...')
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Query failed with error:', error)
  } else {
    console.log('Query succeeded! Data:', data)
  }
}

run()
