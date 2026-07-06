import fs from 'fs';
import Stripe from 'stripe';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function run() {
  const pi = await stripe.paymentIntents.retrieve('pi_3TpDNTPy1AgnSrYF2VkrgjJy');
  console.log("PI metadata:", pi.metadata);
}
run();
