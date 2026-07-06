import { supabaseAdmin } from './supabase';

// Fetches everything the storefront needs from the admin-managed tables:
// content key/value map, active categories, active delivery zones, and
// parsed numeric settings. Called from server components.
export async function getSiteData() {
  const [contentRes, categoriesRes, zonesRes] = await Promise.all([
    supabaseAdmin.from('site_content').select('key, type, value'),
    supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order'),
    supabaseAdmin.from('delivery_zones').select('area').eq('is_active', true).order('sort_order'),
  ]);

  const content = {};
  for (const row of contentRes.data || []) {
    if (row.type === 'json') {
      try { content[row.key] = JSON.parse(row.value); } catch { content[row.key] = null; }
    } else {
      content[row.key] = row.value;
    }
  }

  return {
    content,
    categories: categoriesRes.data || [],
    zones: (zonesRes.data || []).map(z => z.area),
    settings: getSettings(content),
  };
}

export function getSettings(content) {
  const num = (key, fallback) => {
    const v = parseInt(content[key], 10);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    freeDeliveryThresholdFils: num('settings.free_delivery_threshold_fils', 20000),
    deliveryFeeFils: num('settings.delivery_fee_fils', 1500),
    vatRatePercent: num('settings.vat_rate_percent', 5),
  };
}

// Settings-only fetch for API routes (payments).
export async function getStoreSettings() {
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('key, value')
    .eq('content_group', 'settings');
  const content = {};
  for (const row of data || []) content[row.key] = row.value;
  return getSettings(content);
}
