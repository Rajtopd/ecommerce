import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/adminAuth';
import { createSessionToken } from '@/lib/adminSession';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: admin } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, password_hash, role, is_active')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (!admin || !admin.is_active || !verifyPassword(password, admin.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await supabaseAdmin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const token = await createSessionToken({ email: admin.email, role: admin.role });

    const response = NextResponse.json({ success: true, role: admin.role });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  // Current session info (used by admin UI for role-based nav)
  const { requireAdmin } = await import('@/lib/adminAuth');
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, email: session.email, role: session.role });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  response.cookies.delete('admin_token'); // legacy cookie cleanup
  return response;
}
