import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const orderId = '9e0fdca9-7e10-4c0b-8ac4-69cd009f8b0f';
  const shippingAddress = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "123456789",
    address: "Test address",
    area: "Downtown Dubai",
    city: "Dubai"
  };
  
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      guest_email: shippingAddress.email,
      guest_phone: shippingAddress.phone,
      shipping_address: shippingAddress,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select();
    
  console.log("Update Data:", data);
  console.log("Update Error:", error);
}
run();
