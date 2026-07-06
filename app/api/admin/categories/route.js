import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

export async function POST(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name, image_url, sort_order, is_active } = await request.json();
    if (!name || !name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: name.trim(),
        slug,
        image_url: image_url || null,
        sort_order: Number.isFinite(+sort_order) ? +sort_order : 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'A category with that name already exists' }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ category: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
