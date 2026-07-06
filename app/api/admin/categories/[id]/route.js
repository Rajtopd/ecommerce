import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const patch = {};
    if (typeof body.name === 'string' && body.name.trim()) {
      patch.name = body.name.trim();
      patch.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if ('image_url' in body) patch.image_url = body.image_url || null;
    if ('sort_order' in body && Number.isFinite(+body.sort_order)) patch.sort_order = +body.sort_order;
    if ('is_active' in body) patch.is_active = !!body.is_active;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('categories').update(patch).eq('id', params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath('/', 'layout');
    return NextResponse.json({ category: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Block deletion while products still reference the category name
  const { data: cat } = await supabaseAdmin.from('categories').select('name').eq('id', params.id).single();
  if (cat) {
    const { count } = await supabaseAdmin
      .from('products').select('*', { count: 'exact', head: true }).eq('category', cat.name);
    if (count > 0) {
      return NextResponse.json(
        { error: `${count} product(s) still use "${cat.name}". Reassign them first, or deactivate the category instead.` },
        { status: 400 }
      );
    }
  }

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
