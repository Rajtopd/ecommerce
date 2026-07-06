// Seeds admin-control-plane tables from the previously hardcoded storefront values.
// Idempotent: inserts skip rows that already exist (never overwrites admin edits).
// Usage: node scripts/seed_admin_control_plane.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split('\n').reduce((acc, line) => {
    const m = line.match(/^([^=#\s][^=]*)=(.*)$/);
    if (m) acc[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const CONTENT = [
  // group, key, type, label, value
  ['brand', 'brand.name', 'text', 'Brand name', 'Soul Sisters'],
  ['brand', 'brand.tagline', 'text', 'Brand tagline', 'Ethnic Couture · Dubai'],

  ['announcement', 'announcement.primary', 'text', 'Announcement bar — main message', 'Free delivery across Dubai on orders over د.إ 200'],
  ['announcement', 'announcement.secondary', 'text', 'Announcement bar — extra message (desktop only)', 'Eid 2026 Collection is Live'],

  ['hero', 'hero.badge', 'text', 'Hero — small badge line', 'New Arrivals · Eid 2026'],
  ['hero', 'hero.heading_line1', 'text', 'Hero heading — line 1', 'Dressed in'],
  ['hero', 'hero.heading_accent', 'text', 'Hero heading — gold italic line', 'Heritage,'],
  ['hero', 'hero.heading_line3', 'text', 'Hero heading — line 3', 'Living Modern'],
  ['hero', 'hero.subtext', 'text', 'Hero — paragraph under heading', 'Curated Indian ethnic wear for the modern woman in Dubai. From bridal lehengas to everyday kurtis — your culture, beautifully worn.'],
  ['hero', 'hero.cta_primary_label', 'text', 'Hero — primary button label', 'Explore Collection'],
  ['hero', 'hero.cta_primary_href', 'text', 'Hero — primary button link', '/shop'],
  ['hero', 'hero.cta_secondary_label', 'text', 'Hero — secondary button label', 'New Arrivals'],
  ['hero', 'hero.cta_secondary_href', 'text', 'Hero — secondary button link', '/shop?sort=newest'],
  ['hero', 'hero.image', 'image', 'Hero — editorial image', '/images/hero-editorial.jpg'],
  ['hero', 'hero.card_badge', 'text', 'Hero — floating card badge', 'New In'],
  ['hero', 'hero.card_title', 'text', 'Hero — floating card title', "Eid Collection '26"],
  ['hero', 'hero.card_subtitle', 'text', 'Hero — floating card subtitle', '48 new styles added'],

  ['usp', 'usp.items', 'json', 'USP strip — 4 items (icon: truck | undo | shield | sparkles)', JSON.stringify([
    { icon: 'truck', title: 'Free Dubai Delivery', detail: 'On orders over د.إ 200' },
    { icon: 'undo', title: '7-Day Easy Returns', detail: 'No questions asked' },
    { icon: 'shield', title: 'Secure Checkout', detail: 'Powered by Stripe' },
    { icon: 'sparkles', title: 'Artisan Crafted', detail: '100+ artisans across India' },
  ])],

  ['home', 'home.categories_heading', 'text', 'Homepage — categories section heading', 'Shop by Category'],
  ['home', 'home.featured_heading', 'text', 'Homepage — featured section heading', 'Featured Collection'],
  ['home', 'home.featured_link_label', 'text', 'Homepage — featured section link label', 'View All'],

  ['story', 'story.heading', 'text', 'Brand story — heading (use \\n for line break)', 'Rooted in tradition,\ndesigned for today.'],
  ['story', 'story.body', 'text', 'Brand story — paragraph', 'Every piece at Soul Sisters tells a story of craftsmanship. We work directly with artisans across India to bring you authentic textiles, reimagined in contemporary silhouettes that fit the vibrant lifestyle of Dubai.'],
  ['story', 'story.stats', 'json', 'Brand story — 3 stats (value + label)', JSON.stringify([
    { value: '100+', label: 'Artisans' },
    { value: 'Premium', label: 'Fabrics' },
    { value: 'Bespoke', label: 'Tailoring' },
  ])],
  ['story', 'story.image', 'image', 'Brand story — image', '/images/story-artisan.jpg'],
  ['story', 'story.caption', 'text', 'Brand story — image caption', 'sourced from artisan markets'],

  ['footer', 'footer.newsletter_eyebrow', 'text', 'Footer — newsletter eyebrow', 'Join the Sisterhood'],
  ['footer', 'footer.newsletter_heading', 'text', 'Footer — newsletter heading', 'First to know. New drops, private sales.'],
  ['footer', 'footer.blurb', 'text', 'Footer — brand blurb', 'Curated Indian ethnic wear for the modern woman in Dubai — crafted by artisans, delivered to your door.'],
  ['footer', 'footer.help_links', 'json', 'Footer — help column links', JSON.stringify([
    { label: 'Track Your Order', href: '/track' },
    { label: 'My Account', href: '/account' },
    { label: 'Returns & Exchanges', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'Contact Us', href: '#' },
  ])],
  ['footer', 'footer.delivery_lines', 'json', 'Footer — delivery column lines', JSON.stringify([
    'Dubai, UAE only', 'Free over د.إ 200', '1–3 business days', '7-day easy returns',
  ])],
  ['footer', 'footer.instagram_url', 'text', 'Footer — Instagram URL', '#'],
  ['footer', 'footer.whatsapp_url', 'text', 'Footer — WhatsApp URL', '#'],
  ['footer', 'footer.copyright', 'text', 'Footer — copyright line', '© 2026 Soul Sisters. All rights reserved.'],

  ['product', 'product.trust_badges', 'json', 'Product page — trust badges (icon: truck | undo | shield)', JSON.stringify([
    { icon: 'truck', text: 'Free delivery across Dubai' },
    { icon: 'undo', text: 'Easy 7-day returns in Dubai' },
    { icon: 'shield', text: 'Authenticity guaranteed' },
  ])],
  ['product', 'product.size_guide_url', 'text', 'Product page — size guide link', '#'],

  ['cart', 'cart.empty_text', 'text', 'Cart drawer — empty state text', 'Your bag is empty.'],
  ['cart', 'cart.footer_note', 'text', 'Cart drawer — note under subtotal', 'Shipping and VAT calculated at checkout'],

  ['settings', 'settings.free_delivery_threshold_fils', 'text', 'Free delivery threshold (fils, e.g. 20000 = د.إ 200)', '20000'],
  ['settings', 'settings.delivery_fee_fils', 'text', 'Standard delivery fee (fils, e.g. 1500 = د.إ 15)', '1500'],
  ['settings', 'settings.vat_rate_percent', 'text', 'VAT rate (%)', '5'],

  ['notifications', 'notifications.order_confirmed_email_subject', 'text', 'Email — order confirmed subject', 'Your Soul Sisters order {{order_number}} is confirmed'],
  ['notifications', 'notifications.order_confirmed_email_body', 'text', 'Email — order confirmed body', 'Dear {{customer_name}},\n\nThank you for shopping with Soul Sisters! Your order {{order_number}} has been confirmed and is being prepared.\n\nOrder total: {{total}}\nDelivery to: {{area}}, Dubai\n\nWe will notify you when your order is out for delivery.\n\nWith love,\nSoul Sisters'],
  ['notifications', 'notifications.order_shipped_sms', 'text', 'SMS — order out for delivery', 'Soul Sisters: Your order {{order_number}} is out for delivery and will reach you today. Track: {{tracking_url}}'],
  ['notifications', 'notifications.order_delivered_sms', 'text', 'SMS — order delivered', 'Soul Sisters: Your order {{order_number}} has been delivered. We hope you love it! Easy 7-day returns if you need them.'],
];

const CATEGORIES = [
  { name: 'Dresses', slug: 'dresses', image_url: '/images/cat-dresses.jpg', sort_order: 1 },
  { name: 'Tops', slug: 'tops', image_url: '/images/cat-tops.jpg', sort_order: 2 },
  { name: 'Bottoms', slug: 'bottoms', image_url: '/images/cat-bottoms.jpg', sort_order: 3 },
  { name: 'Co-ords', slug: 'co-ords', image_url: '/images/cat-coords.jpg', sort_order: 4 },
  { name: 'Outerwear', slug: 'outerwear', image_url: '/images/cat-outerwear.jpg', sort_order: 5 },
  { name: 'Accessories', slug: 'accessories', image_url: '/images/cat-accessories.jpg', sort_order: 6 },
];

const AREAS = [
  'Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'JLT', 'Business Bay',
  'Al Barsha', 'Deira', 'Bur Dubai', 'Mirdif', 'Palm Jumeirah',
  'DIFC', 'Al Quoz', 'Sports City', 'Silicon Oasis', 'Discovery Gardens',
  'Al Nahda', 'Karama', 'Satwa', 'Oud Metha', 'Rashidiya',
];

async function main() {
  // Content: insert only missing keys
  const { data: existing } = await sb.from('site_content').select('key');
  const existingKeys = new Set((existing || []).map(r => r.key));
  const contentRows = CONTENT
    .filter(([, key]) => !existingKeys.has(key))
    .map(([content_group, key, type, label, value]) => ({ content_group, key, type, label, value }));
  if (contentRows.length) {
    const { error } = await sb.from('site_content').insert(contentRows);
    if (error) throw new Error('site_content: ' + error.message);
  }
  console.log(`site_content: inserted ${contentRows.length} (${existingKeys.size} already present)`);

  // Categories
  for (const c of CATEGORIES) {
    const { error } = await sb.from('categories').upsert(c, { onConflict: 'name', ignoreDuplicates: true });
    if (error) throw new Error('categories: ' + error.message);
  }
  console.log('categories: seeded');

  // Delivery zones
  for (let i = 0; i < AREAS.length; i++) {
    const { error } = await sb.from('delivery_zones').upsert(
      { area: AREAS[i], sort_order: i + 1 }, { onConflict: 'area', ignoreDuplicates: true });
    if (error) throw new Error('delivery_zones: ' + error.message);
  }
  console.log('delivery_zones: seeded');

  // Owner admin account (password = existing ADMIN_PASSWORD)
  const ownerEmail = 'owner@soulsisters.ae';
  const { data: owner } = await sb.from('admin_users').select('id').eq('email', ownerEmail).maybeSingle();
  if (!owner) {
    if (!env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD missing from .env.local');
    const { error } = await sb.from('admin_users').insert({
      email: ownerEmail,
      full_name: 'Store Owner',
      password_hash: scryptHash(env.ADMIN_PASSWORD),
      role: 'owner',
    });
    if (error) throw new Error('admin_users: ' + error.message);
    console.log(`admin_users: created owner ${ownerEmail} (password = ADMIN_PASSWORD from .env.local)`);
  } else {
    console.log('admin_users: owner already exists');
  }

  console.log('Seed complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
