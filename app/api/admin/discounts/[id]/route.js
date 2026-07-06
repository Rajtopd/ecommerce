import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const patch = { updated_at: new Date().toISOString() };
    if ('description' in body) patch.description = body.description || null;
    if ('kind' in body) patch.kind = body.kind === 'fixed' ? 'fixed' : 'percent';
    if ('value' in body) {
      const v = Math.round(+body.value);
      if (!Number.isFinite(v) || v <= 0) return NextResponse.json({ error: 'Value must be positive' }, { status: 400 });
      patch.value = v;
    }
    if ('min_order_fils' in body) patch.min_order_fils = Math.max(0, Math.round(+body.min_order_fils) || 0);
    if ('starts_at' in body) patch.starts_at = body.starts_at || null;
    if ('ends_at' in body) patch.ends_at = body.ends_at || null;
    if ('usage_limit' in body) patch.usage_limit = Number.isFinite(+body.usage_limit) && +body.usage_limit > 0 ? Math.round(+body.usage_limit) : null;
    if ('is_active' in body) patch.is_active = !!body.is_active;

    const { data, error } = await supabaseAdmin
      .from('discounts').update(patch).eq('id', params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ discount: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabaseAdmin.from('discounts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
