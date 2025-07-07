// Test RPC function directly
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nliifuijvzmtowwwfbfp.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY' // You'll need to add this

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRPC() {
  console.log('Testing RPC function...')
  
  const { data, error } = await supabase
    .rpc('get_redirect_url_for_short_code', { p_short_code: 'pbVgQc' })
  
  if (error) {
    console.error('RPC Error:', error)
  } else {
    console.log('RPC Result:', data)
  }
}

testRPC()