import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin, hashPassword } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
  const session = await requireAdmin(request, 'owner');
  if (!session) return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  try {
    const body = await request.json();
    const patch = {};
    if ('full_name' in body) patch.full_name = body.full_name || null;
    if ('role' in body) patch.role = body.role === 'owner' ? 'owner' : 'staff';
    if ('is_active' in body) patch.is_active = !!body.is_active;
    if (body.password) {
      if (body.password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      patch.password_hash = hashPassword(body.password);
    }

    // Prevent locking yourself out
    const { data: target } = await supabaseAdmin.from('admin_users').select('email').eq('id', params.id).single();
    if (target?.email === session.email && (patch.is_active === false || patch.role === 'staff')) {
      return NextResponse.json({ error: 'You cannot deactivate or demote your own account' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('admin_users').update(patch).eq('id', params.id)
      .select('id, email, full_name, role, is_active, created_at, last_login_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ admin: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin(request, 'owner');
  if (!session) return NextResponse.json({ error: 'Owner access required' }, { status: 403 });

  const { data: target } = await supabaseAdmin.from('admin_users').select('email').eq('id', params.id).single();
  if (target?.email === session.email) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
