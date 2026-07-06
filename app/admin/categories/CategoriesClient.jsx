'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { PageTitle, Card, Label, Input, Btn, Toggle, Notice, th, td } from '@/components/admin/AdminUI';

export default function CategoriesClient({ initialCategories, productCounts }) {
  const [categories, setCategories] = useState(initialCategories);
  const [notice, setNotice] = useState(null);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [busy, setBusy] = useState(false);

  const api = async (url, method, body) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    setBusy(true); setNotice(null);
    try {
      const { category } = await api('/api/admin/categories', 'POST', {
        name: newName, image_url: newImage, sort_order: categories.length + 1,
      });
      setCategories([...categories, category]);
      setNewName(''); setNewImage('');
      setNotice({ kind: 'success', text: `Added "${category.name}". It is now live in the storefront navigation.` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
    finally { setBusy(false); }
  };

  const patch = async (id, body) => {
    setNotice(null);
    try {
      const { category } = await api(`/api/admin/categories/${id}`, 'PATCH', body);
      setCategories(cs => cs.map(c => c.id === id ? category : c));
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  const remove = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setNotice(null);
    try {
      await api(`/api/admin/categories/${cat.id}`, 'DELETE');
      setCategories(cs => cs.filter(c => c.id !== cat.id));
      setNotice({ kind: 'success', text: `Deleted "${cat.name}".` });
    } catch (e) { setNotice({ kind: 'error', text: e.message }); }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      <PageTitle>Categories</PageTitle>
      <p style={{ fontSize: '13px', color: '#9C7B5E', margin: '-12px 0 24px' }}>
        Controls the navigation menu, homepage category tiles, shop filters and footer links.
      </p>

      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Image</th>
              <th style={th}>Name</th>
              <th style={th}>Products</th>
              <th style={th}>Order</th>
              <th style={th}>Visible</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td style={td}>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'soul_sisters_products'}
                    onSuccess={(r) => { if (r?.info?.secure_url) patch(cat.id, { image_url: r.info.secure_url }); }}
                  >
                    {({ open }) => (
                      <button onClick={() => open()} title="Click to change image" style={{ border: '1px solid #E0D0B8', borderRadius: '4px', padding: 0, cursor: 'pointer', width: '44px', height: '55px', position: 'relative', overflow: 'hidden', backgroundColor: '#FAF7F0' }}>
                        {cat.image_url && <Image src={cat.image_url} alt={cat.name} fill sizes="44px" style={{ objectFit: 'cover' }} unoptimized={cat.image_url.startsWith('http')} />}
                      </button>
                    )}
                  </CldUploadWidget>
                </td>
                <td style={td}>
                  <Input
                    defaultValue={cat.name}
                    onBlur={e => { if (e.target.value.trim() && e.target.value !== cat.name) patch(cat.id, { name: e.target.value }); }}
                    style={{ width: '180px' }}
                  />
                </td>
                <td style={td}>{productCounts[cat.name] || 0}</td>
                <td style={td}>
                  <Input
                    type="number"
                    defaultValue={cat.sort_order}
                    onBlur={e => { if (+e.target.value !== cat.sort_order) patch(cat.id, { sort_order: +e.target.value }); }}
                    style={{ width: '64px' }}
                  />
                </td>
                <td style={td}><Toggle checked={cat.is_active} onChange={() => patch(cat.id, { is_active: !cat.is_active })} /></td>
                <td style={td}><Btn variant="danger" onClick={() => remove(cat)} style={{ padding: '6px 12px' }}>Delete</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <Label>Add a category</Label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Input placeholder="Category name" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '220px' }} />
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'soul_sisters_products'}
            onSuccess={(r) => { if (r?.info?.secure_url) setNewImage(r.info.secure_url); }}
          >
            {({ open }) => <Btn variant="ghost" onClick={() => open()}>{newImage ? 'Image ✓' : 'Upload image'}</Btn>}
          </CldUploadWidget>
          <Btn onClick={addCategory} disabled={busy || !newName.trim()}>Add category</Btn>
        </div>
      </Card>
    </div>
  );
}
