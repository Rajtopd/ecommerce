import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('content_group')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data });
}

// Bulk update: { updates: [{ key, value }] }
export async function PUT(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { updates } = await request.json();
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    for (const u of updates) {
      if (typeof u.key !== 'string' || typeof u.value !== 'string') {
        return NextResponse.json({ error: `Invalid update for key: ${u.key}` }, { status: 400 });
      }
      // JSON-typed keys must contain valid JSON
      const { data: row } = await supabaseAdmin.from('site_content').select('type').eq('key', u.key).maybeSingle();
      if (!row) return NextResponse.json({ error: `Unknown content key: ${u.key}` }, { status: 400 });
      if (row.type === 'json') {
        try { JSON.parse(u.value); } catch {
          return NextResponse.json({ error: `Invalid JSON for ${u.key}` }, { status: 400 });
        }
      }
      const { error } = await supabaseAdmin
        .from('site_content')
        .update({ value: u.value, updated_at: new Date().toISOString() })
        .eq('key', u.key);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, updated: updates.length });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
