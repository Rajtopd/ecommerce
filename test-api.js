import fetch from 'node-fetch';

async function run() {
  const payload = {
    paymentIntentId: 'pi_3TpDNTPy1AgnSrYF2VkrgjJy',
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '123456789',
      address: 'Test address',
      area: 'Downtown Dubai',
      city: 'Dubai',
    }
  };

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
