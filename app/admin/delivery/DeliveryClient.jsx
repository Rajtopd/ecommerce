'use client';

import { useState } from 'react';
import { PageTitle, Card, SectionTitle, Label, Input, Btn, Toggle, Notice, th, td } from '@/components/admin/AdminUI';

const SETTING_META = {
  'settings.free_delivery_threshold_fils': { label: 'Free delivery over (AED)', toDisplay: v => (v / 100).toString(), toStored: v => String(Math.round(+v * 100)) },
  'settings.delivery_fee_fils': { label: 'Standard delivery fee (AED)', toDisplay: v => (v / 100).toString(), toStored: v => String(Math.round(+v * 100)) },
  'settings.vat_rate_percent': { label: 'VAT rate (%)', toDisplay: v => String(v), toStored: v => String(Math.round(+v)) },
};

export default function DeliveryClient({ initialZones, initialSettings }) {
  const [zones, setZones] = useState(initialZones);
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(initialSettings.map(s => {
      const meta = SETTING_META[s.key];
      return [s.key, meta ? meta.toDisplay(parseInt(s.value, 10) || 0) : s.value];
    }))
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const api = async (url, method, body) => {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const saveSettings = async () => {
    setBusy(true); setNotice(null);
    try {
      for (const key of Object.keys(settings)) {
        const raw = settings[key];
        if (raw === '' || !Number.isFinite(+raw) || +raw < 0) throw new Error(`"${SETTING_META[key]?.label || key}" must be a non-negative number`);
      }
      const updates = Object.keys(settings).map(key => ({
        key,
        value: SETTING_META[key] ? SETTING_META[key].toStored(settings[key]) : settings[key],
      }));
      await api('/api/admin/content', 'PUT', { updates });
      setSettingsDirty(false);
      setNotice({ kind: 'success', text: 'Delivery settings saved. Checkout totals now use the new values.' });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
    finally { setBusy(false); }
  };

  const patchZone = async (id, body) => {
    setNotice(null);
    try {
      const { zone } = await api(`/api/admin/zones/${id}`, 'PATCH', body);
      setZones(zs => zs.map(z => z.id === id ? zone : z));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  const addZone = async () => {
    if (!newArea.trim()) return;
    setBusy(true); setNotice(null);
    try {
      const { zone } = await api('/api/admin/zones', 'POST', { area: newArea, sort_order: zones.length + 1 });
      setZones([...zones, zone]);
      setNewArea('');
      setNotice({ kind: 'success', text: `Added "${zone.area}" to the checkout delivery areas.` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
    finally { setBusy(false); }
  };

  const removeZone = async (zone) => {
    if (!confirm(`Remove "${zone.area}" from delivery areas?`)) return;
    setNotice(null);
    try {
      await api(`/api/admin/zones/${zone.id}`, 'DELETE');
      setZones(zs => zs.filter(z => z.id !== zone.id));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      <PageTitle>Delivery & Shipping</PageTitle>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Card>
        <SectionTitle>Rates & VAT</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          {Object.keys(SETTING_META).filter(k => k in settings).map(key => (
            <div key={key}>
              <Label>{SETTING_META[key].label}</Label>
              <Input
                type="number"
                min="0"
                value={settings[key]}
                onChange={e => { setSettings(s => ({ ...s, [key]: e.target.value })); setSettingsDirty(true); setNotice(null); }}
              />
            </div>
          ))}
        </div>
        <Btn onClick={saveSettings} disabled={busy || !settingsDirty}>{busy ? 'Saving…' : 'Save settings'}</Btn>
        <p style={{ fontSize: '12px', color: '#9C7B5E', marginTop: '12px', marginBottom: 0 }}>
          One flat delivery rate applies across all zones. Orders above the free-delivery threshold ship free.
        </p>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Delivery area</th>
              <th style={th}>Order</th>
              <th style={th}>Available at checkout</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone.id}>
                <td style={td}>{zone.area}</td>
                <td style={td}>
                  <Input type="number" defaultValue={zone.sort_order}
                    onBlur={e => { if (+e.target.value !== zone.sort_order) patchZone(zone.id, { sort_order: +e.target.value }); }}
                    style={{ width: '64px' }} />
                </td>
                <td style={td}><Toggle checked={zone.is_active} onChange={() => patchZone(zone.id, { is_active: !zone.is_active })} /></td>
                <td style={td}><Btn variant="danger" onClick={() => removeZone(zone)} style={{ padding: '6px 12px' }}>Remove</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '16px', borderTop: '1px solid #F0E9DC', display: 'flex', gap: '10px' }}>
          <Input placeholder="New delivery area (e.g. Jumeirah Village Circle)" value={newArea} onChange={e => setNewArea(e.target.value)} style={{ width: '320px' }} />
          <Btn onClick={addZone} disabled={busy || !newArea.trim()}>Add area</Btn>
        </div>
      </Card>
    </div>
  );
}
