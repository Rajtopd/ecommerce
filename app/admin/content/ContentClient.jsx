'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { PageTitle, Card, SectionTitle, Label, Input, Textarea, Btn, Notice } from '@/components/admin/AdminUI';

const GROUP_ORDER = ['announcement', 'hero', 'usp', 'home', 'story', 'footer', 'brand', 'product', 'cart', 'notifications'];
const GROUP_LABELS = {
  announcement: 'Announcement Bar',
  hero: 'Homepage — Hero Section',
  usp: 'Homepage — USP Strip',
  home: 'Homepage — Section Headings',
  story: 'Homepage — Brand Story',
  footer: 'Footer',
  brand: 'Brand',
  product: 'Product Page',
  cart: 'Cart Drawer',
  notifications: 'Email & SMS Templates',
};
const GROUP_HINTS = {
  notifications: 'Templates support placeholders like {{order_number}}, {{customer_name}}, {{total}}, {{area}}, {{tracking_url}}. Note: no email/SMS provider is connected yet — these templates are stored and ready for when one is.',
};

export default function ContentClient({ initialContent }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(initialContent.map(r => [r.key, r.value ?? '']))
  );
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const groups = useMemo(() => {
    const byGroup = {};
    for (const row of initialContent) {
      (byGroup[row.content_group] ||= []).push(row);
    }
    return GROUP_ORDER.filter(g => byGroup[g]).map(g => ({ name: g, rows: byGroup[g] }));
  }, [initialContent]);

  const setValue = (key, value) => {
    setValues(v => ({ ...v, [key]: value }));
    setDirty(d => ({ ...d, [key]: true }));
    setNotice(null);
  };

  const dirtyCount = Object.keys(dirty).length;

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const updates = Object.keys(dirty).map(key => ({ key, value: values[key] }));
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDirty({});
      setNotice({ kind: 'success', text: `Saved ${updates.length} change(s). The storefront is updated.` });
    } catch (err) {
      setNotice({ kind: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      <PageTitle
        right={<Btn onClick={save} disabled={saving || dirtyCount === 0}>{saving ? 'Saving…' : dirtyCount > 0 ? `Save ${dirtyCount} change(s)` : 'All saved'}</Btn>}
      >
        Site Content
      </PageTitle>
      <p style={{ fontSize: '13px', color: '#9C7B5E', margin: '-12px 0 24px' }}>
        Every text and image the customer sees. Edit and save — changes appear on the storefront immediately.
      </p>

      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      {groups.map(group => (
        <Card key={group.name}>
          <SectionTitle>{GROUP_LABELS[group.name] || group.name}</SectionTitle>
          {GROUP_HINTS[group.name] && (
            <p style={{ fontSize: '12px', color: '#9C7B5E', margin: '-8px 0 16px', lineHeight: 1.5 }}>{GROUP_HINTS[group.name]}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {group.rows.map(row => (
              <Field key={row.key} row={row} value={values[row.key]} onChange={v => setValue(row.key, v)} />
            ))}
          </div>
        </Card>
      ))}

      <div style={{ position: 'sticky', bottom: '16px', textAlign: 'right' }}>
        {dirtyCount > 0 && (
          <Btn onClick={save} disabled={saving} style={{ boxShadow: '0 4px 16px rgba(26,15,10,0.25)' }}>
            {saving ? 'Saving…' : `Save ${dirtyCount} change(s)`}
          </Btn>
        )}
      </div>
    </div>
  );
}

function Field({ row, value, onChange }) {
  if (row.type === 'image') return <ImageField row={row} value={value} onChange={onChange} />;
  if (row.type === 'json') return <JsonField row={row} value={value} onChange={onChange} />;

  const long = (value || '').length > 70 || (value || '').includes('\n');
  return (
    <div>
      <Label>{row.label}</Label>
      {long
        ? <Textarea value={value} rows={Math.min(8, Math.max(3, (value || '').split('\n').length + 1))} onChange={e => onChange(e.target.value)} />
        : <Input value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function ImageField({ row, value, onChange }) {
  return (
    <div>
      <Label>{row.label}</Label>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '96px', height: '120px', borderRadius: '4px', border: '1px solid #E0D0B8', overflow: 'hidden', position: 'relative', backgroundColor: '#FAF7F0', flexShrink: 0 }}>
          {value ? (
            <Image src={value} alt={row.label} fill sizes="96px" style={{ objectFit: 'cover' }} unoptimized={value.startsWith('http')} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#9C7B5E' }}>No image</div>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'soul_sisters_products'}
            onSuccess={(result) => { if (result?.info?.secure_url) onChange(result.info.secure_url); }}
          >
            {({ open }) => (
              <Btn variant="ghost" onClick={() => open()} style={{ alignSelf: 'flex-start' }}>Upload new image</Btn>
            )}
          </CldUploadWidget>
          <Input value={value} onChange={e => onChange(e.target.value)} placeholder="…or paste an image URL / path" />
        </div>
      </div>
    </div>
  );
}

// Structured editor for JSON values: arrays of strings or arrays of flat objects.
function JsonField({ row, value, onChange }) {
  let parsed;
  try { parsed = JSON.parse(value); } catch { parsed = null; }

  if (!Array.isArray(parsed)) {
    return (
      <div>
        <Label>{row.label}</Label>
        <Textarea value={value} onChange={e => onChange(e.target.value)} />
      </div>
    );
  }

  const isStringList = parsed.every(item => typeof item === 'string');
  const update = (next) => onChange(JSON.stringify(next));

  return (
    <div>
      <Label>{row.label}</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {parsed.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', backgroundColor: '#FAF7F0', borderRadius: '4px', border: '1px solid #F0E9DC' }}>
            {isStringList ? (
              <Input value={item} onChange={e => update(parsed.map((x, j) => j === i ? e.target.value : x))} />
            ) : (
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Object.keys(item).length)}, 1fr)`, gap: '8px' }}>
                {Object.keys(item).map(k => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', color: '#9C7B5E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{k}</div>
                    <Input value={String(item[k] ?? '')} onChange={e => update(parsed.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x))} />
                  </div>
                ))}
              </div>
            )}
            <Btn variant="danger" onClick={() => update(parsed.filter((_, j) => j !== i))} style={{ padding: '8px 10px', flexShrink: 0 }}>✕</Btn>
          </div>
        ))}
        <Btn
          variant="ghost"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            const template = isStringList ? '' : Object.fromEntries(Object.keys(parsed[0] || { text: '' }).map(k => [k, '']));
            update([...parsed, template]);
          }}
        >
          + Add item
        </Btn>
      </div>
    </div>
  );
}
