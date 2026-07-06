import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

function validateDiscount(body) {
  const code = (body.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,32}$/.test(code)) return { error: 'Code must be 2–32 letters/numbers/dashes' };
  const kind = body.kind === 'fixed' ? 'fixed' : 'percent';
  const value = Math.round(+body.value);
  if (!Number.isFinite(value) || value <= 0) return { error: 'Value must be a positive number' };
  if (kind === 'percent' && value > 100) return { error: 'Percent discount cannot exceed 100' };
  return {
    row: {
      code,
      kind,
      value,
      description: body.description || null,
      min_order_fils: Number.isFinite(+body.min_order_fils) ? Math.max(0, Math.round(+body.min_order_fils)) : 0,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      usage_limit: Number.isFinite(+body.usage_limit) && +body.usage_limit > 0 ? Math.round(+body.usage_limit) : null,
      is_active: body.is_active !== false,
    },
  };
}

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('discounts').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ discounts: data });
}

export async function POST(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { row, error: vErr } = validateDiscount(await request.json());
    if (vErr) return NextResponse.json({ error: vErr }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('discounts').insert(row).select().single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'That code already exists' }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ discount: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
