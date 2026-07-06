import { supabaseAdmin } from '@/lib/supabase';

// Evaluates a discount code against a subtotal (fils).
// Returns { discount: { id, code, kind, value, amount } } or { error }.
export async function evaluateDiscount(code, subtotalFils) {
  if (!code) return { error: 'No code provided' };
  const { data: d } = await supabaseAdmin
    .from('discounts')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();

  if (!d || !d.is_active) return { error: 'Invalid discount code' };
  const now = new Date();
  if (d.starts_at && new Date(d.starts_at) > now) return { error: 'This code is not active yet' };
  if (d.ends_at && new Date(d.ends_at) < now) return { error: 'This code has expired' };
  if (d.usage_limit != null && d.used_count >= d.usage_limit) return { error: 'This code has reached its usage limit' };
  if (subtotalFils < d.min_order_fils) {
    return { error: `Minimum order of د.إ ${(d.min_order_fils / 100).toFixed(0)} required for this code` };
  }

  const amount = d.kind === 'percent'
    ? Math.round(subtotalFils * (d.value / 100))
    : Math.min(d.value, subtotalFils);

  return { discount: { id: d.id, code: d.code, kind: d.kind, value: d.value, amount } };
}
