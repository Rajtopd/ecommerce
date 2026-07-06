'use client';

import { useState } from 'react';
import { PageTitle, Card, SectionTitle, Label, Input, Select, Btn, Toggle, Notice, th, td } from '@/components/admin/AdminUI';

const EMPTY = { email: '', full_name: '', password: '', role: 'staff' };

export default function AdminsClient({ initialAdmins, selfEmail }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const api = async (url, method, body) => {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const create = async () => {
    setBusy(true); setNotice(null);
    try {
      const { admin } = await api('/api/admin/admins', 'POST', form);
      setAdmins([...admins, admin]);
      setForm(EMPTY);
      setNotice({ kind: 'success', text: `Added ${admin.email} (${admin.role}). Share their password securely — it is not shown again.` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
    finally { setBusy(false); }
  };

  const patch = async (id, body) => {
    setNotice(null);
    try {
      const { admin } = await api(`/api/admin/admins/${id}`, 'PATCH', body);
      setAdmins(as => as.map(a => a.id === id ? admin : a));
      if (body.password) setNotice({ kind: 'success', text: `Password updated for ${admin.email}.` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  const resetPassword = (a) => {
    const password = prompt(`New password for ${a.email} (min 8 characters):`);
    if (password) patch(a.id, { password });
  };

  const remove = async (a) => {
    if (!confirm(`Delete admin account ${a.email}?`)) return;
    try {
      await api(`/api/admin/admins/${a.id}`, 'DELETE');
      setAdmins(as => as.filter(x => x.id !== a.id));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <PageTitle>Admin Accounts</PageTitle>
      <p style={{ fontSize: '13px', color: '#9C7B5E', margin: '-12px 0 24px' }}>
        Owners can do everything including managing these accounts. Staff can manage the store but not admin accounts.
      </p>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Account</th>
              <th style={th}>Role</th>
              <th style={th}>Last login</th>
              <th style={th}>Active</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => {
              const isSelf = a.email === selfEmail;
              return (
                <tr key={a.id}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{a.full_name || '—'} {isSelf && <span style={{ fontSize: '10px', color: '#C49B38' }}>(you)</span>}</div>
                    <div style={{ fontSize: '12px', color: '#9C7B5E' }}>{a.email}</div>
                  </td>
                  <td style={td}>
                    <Select value={a.role} disabled={isSelf} onChange={e => patch(a.id, { role: e.target.value })} style={{ width: '100px' }}>
                      <option value="owner">Owner</option>
                      <option value="staff">Staff</option>
                    </Select>
                  </td>
                  <td style={{ ...td, fontSize: '12px', color: '#9C7B5E' }}>
                    {a.last_login_at ? new Date(a.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td style={td}><Toggle checked={a.is_active} disabled={isSelf} onChange={() => patch(a.id, { is_active: !a.is_active })} /></td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Btn variant="ghost" onClick={() => resetPassword(a)} style={{ padding: '6px 12px' }}>Reset password</Btn>
                      {!isSelf && <Btn variant="danger" onClick={() => remove(a)} style={{ padding: '6px 12px' }}>Delete</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionTitle>Add an admin</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Password (min 8)</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </Select>
          </div>
        </div>
        <Btn onClick={create} disabled={busy || !form.email || form.password.length < 8}>Add admin</Btn>
      </Card>
    </div>
  );
}
