import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin, hashPassword } from '@/lib/adminAuth';

// Admin account management — owner role only.
export async function GET(request) {
  if (!(await requireAdmin(request, 'owner'))) return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, email, full_name, role, is_active, created_at, last_login_at')
    .order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data });
}

export async function POST(request) {
  if (!(await requireAdmin(request, 'owner'))) return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  try {
    const { email, full_name, password, role } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: cleanEmail,
        full_name: full_name || null,
        password_hash: hashPassword(password),
        role: role === 'owner' ? 'owner' : 'staff',
      })
      .select('id, email, full_name, role, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'An admin with that email already exists' }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ admin: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
