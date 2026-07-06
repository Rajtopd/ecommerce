import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const patch = {};
    if (typeof body.area === 'string' && body.area.trim()) patch.area = body.area.trim();
    if ('sort_order' in body && Number.isFinite(+body.sort_order)) patch.sort_order = +body.sort_order;
    if ('is_active' in body) patch.is_active = !!body.is_active;

    const { data, error } = await supabaseAdmin
      .from('delivery_zones').update(patch).eq('id', params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath('/', 'layout');
    return NextResponse.json({ zone: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabaseAdmin.from('delivery_zones').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
