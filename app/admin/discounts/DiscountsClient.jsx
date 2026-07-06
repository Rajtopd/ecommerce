'use client';

import { useState } from 'react';
import { PageTitle, Card, SectionTitle, Label, Input, Select, Btn, Toggle, Notice, th, td } from '@/components/admin/AdminUI';

const EMPTY = { code: '', description: '', kind: 'percent', value: '', min_order_aed: '', usage_limit: '', starts_at: '', ends_at: '' };

export default function DiscountsClient({ initialDiscounts }) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
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
      const { discount } = await api('/api/admin/discounts', 'POST', {
        code: form.code,
        description: form.description,
        kind: form.kind,
        value: form.kind === 'fixed' ? Math.round(+form.value * 100) : +form.value,
        min_order_fils: form.min_order_aed ? Math.round(+form.min_order_aed * 100) : 0,
        usage_limit: form.usage_limit ? +form.usage_limit : null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      });
      setDiscounts([discount, ...discounts]);
      setForm(EMPTY);
      setNotice({ kind: 'success', text: `Code ${discount.code} is live — customers can use it at checkout now.` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
    finally { setBusy(false); }
  };

  const patch = async (id, body) => {
    setNotice(null);
    try {
      const { discount } = await api(`/api/admin/discounts/${id}`, 'PATCH', body);
      setDiscounts(ds => ds.map(d => d.id === id ? discount : d));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  const remove = async (d) => {
    if (!confirm(`Delete code ${d.code}?`)) return;
    try {
      await api(`/api/admin/discounts/${d.id}`, 'DELETE');
      setDiscounts(ds => ds.filter(x => x.id !== d.id));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  const fmtValue = (d) => d.kind === 'percent' ? `${d.value}%` : `د.إ ${(d.value / 100).toFixed(0)}`;

  return (
    <div style={{ maxWidth: '980px' }}>
      <PageTitle>Discounts</PageTitle>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Card>
        <SectionTitle>Create a discount code</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <div>
            <Label>Code</Label>
            <Input placeholder="EID25" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off (AED)</option>
            </Select>
          </div>
          <div>
            <Label>{form.kind === 'percent' ? 'Percent (%)' : 'Amount (AED)'}</Label>
            <Input type="number" min="1" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
          </div>
          <div>
            <Label>Min order (AED, optional)</Label>
            <Input type="number" min="0" value={form.min_order_aed} onChange={e => setForm({ ...form, min_order_aed: e.target.value })} />
          </div>
          <div>
            <Label>Usage limit (optional)</Label>
            <Input type="number" min="1" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} />
          </div>
          <div>
            <Label>Starts (optional)</Label>
            <Input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} />
          </div>
          <div>
            <Label>Ends (optional)</Label>
            <Input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} />
          </div>
          <div>
            <Label>Description (internal)</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <Btn onClick={create} disabled={busy || !form.code.trim() || !form.value}>Create code</Btn>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {discounts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9C7B5E' }}>No discount codes yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Code</th>
                <th style={th}>Discount</th>
                <th style={th}>Min order</th>
                <th style={th}>Used</th>
                <th style={th}>Window</th>
                <th style={th}>Active</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ ...td, fontWeight: 600, letterSpacing: '0.04em' }}>{d.code}</td>
                  <td style={td}>{fmtValue(d)}</td>
                  <td style={td}>{d.min_order_fils ? `د.إ ${(d.min_order_fils / 100).toFixed(0)}` : '—'}</td>
                  <td style={td}>{d.used_count}{d.usage_limit ? ` / ${d.usage_limit}` : ''}</td>
                  <td style={{ ...td, fontSize: '12px', color: '#9C7B5E' }}>
                    {d.starts_at || d.ends_at
                      ? `${d.starts_at ? new Date(d.starts_at).toLocaleDateString() : '…'} → ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : '…'}`
                      : 'Always'}
                  </td>
                  <td style={td}><Toggle checked={d.is_active} onChange={() => patch(d.id, { is_active: !d.is_active })} /></td>
                  <td style={td}><Btn variant="danger" onClick={() => remove(d)} style={{ padding: '6px 12px' }}>Delete</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
