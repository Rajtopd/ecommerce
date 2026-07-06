import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabase';
import AdminsClient from './AdminsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAdminsPage() {
  const session = await verifySessionToken(cookies().get('admin_session')?.value);
  if (!session || session.role !== 'owner') redirect('/admin');

  const { data: admins } = await supabaseAdmin
    .from('admin_users')
    .select('id, email, full_name, role, is_active, created_at, last_login_at')
    .order('created_at');

  return <AdminsClient initialAdmins={admins || []} selfEmail={session.email} />;
}
