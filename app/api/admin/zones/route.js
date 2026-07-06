import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('delivery_zones').select('*').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ zones: data });
}

export async function POST(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { area, sort_order } = await request.json();
    if (!area || !area.trim()) return NextResponse.json({ error: 'Area name is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('delivery_zones')
      .insert({ area: area.trim(), sort_order: Number.isFinite(+sort_order) ? +sort_order : 999 })
      .select().single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'That area already exists' }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ zone: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
