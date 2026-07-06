'use client';

import { useState } from 'react';
import { PageTitle, Card, Input, th, td } from '@/components/admin/AdminUI';

export default function CustomersClient({ customers }) {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.email || '').toLowerCase().includes(q) || (c.full_name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  return (
    <div style={{ maxWidth: '980px' }}>
      <PageTitle>Customers ({filtered.length})</PageTitle>

      <Input
        placeholder="Search by name, email or phone…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '320px', marginBottom: '16px' }}
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9C7B5E' }}>No customers found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Customer</th>
                <th style={th}>Phone</th>
                <th style={th}>Orders</th>
                <th style={th}>Total spent</th>
                <th style={th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{c.full_name || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#9C7B5E' }}>{c.email}</div>
                  </td>
                  <td style={td}>{c.phone || '—'}</td>
                  <td style={td}>{c.order_count}</td>
                  <td style={td}>د.إ {(c.total_spent / 100).toFixed(2)}</td>
                  <td style={{ ...td, fontSize: '12px', color: '#9C7B5E' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
