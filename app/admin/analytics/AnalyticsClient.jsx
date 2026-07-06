'use client';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PageTitle, Card, SectionTitle } from '@/components/admin/AdminUI';

const GOLD = '#C49B38';
const MAROON = '#6E1A2C';

export default function AnalyticsClient({ days, topProducts, statusCounts, summary }) {
  const fmtAed = (v) => `د.إ ${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div style={{ maxWidth: '1080px' }}>
      <PageTitle>Analytics</PageTitle>
      <p style={{ fontSize: '13px', color: '#9C7B5E', margin: '-12px 0 24px' }}>Last 30 days.</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <Stat label="Paid revenue" value={fmtAed(summary.paidRevenue / 100)} gold />
        <Stat label="Paid orders" value={summary.paidCount} />
        <Stat label="Average order" value={fmtAed(summary.avgOrder / 100)} />
        <Stat label="All orders" value={summary.totalOrders} />
      </div>

      {/* Revenue chart */}
      <Card>
        <SectionTitle>Daily revenue (AED)</SectionTitle>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={days} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E9DC" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9C7B5E' }} interval={4} tickLine={false} axisLine={{ stroke: '#E0D0B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9C7B5E' }} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(v) => [fmtAed(v), 'Revenue']} contentStyle={{ fontSize: 12, border: '1px solid #E0D0B8', borderRadius: 4 }} />
              <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Orders per day */}
        <Card>
          <SectionTitle>Orders per day</SectionTitle>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={days} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E9DC" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9C7B5E' }} interval={6} tickLine={false} axisLine={{ stroke: '#E0D0B8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9C7B5E' }} tickLine={false} axisLine={false} width={28} />
                <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={{ fontSize: 12, border: '1px solid #E0D0B8', borderRadius: 4 }} />
                <Bar dataKey="orders" fill={MAROON} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <SectionTitle>Top products (paid)</SectionTitle>
          {topProducts.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9C7B5E', padding: '24px 0' }}>No paid orders in this period.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((p, i) => {
                const max = topProducts[0].revenue || 1;
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#1A0F0A', fontWeight: 500 }}>{i + 1}. {p.name}</span>
                      <span style={{ color: '#9C7B5E' }}>{fmtAed(p.revenue)} · {p.units} pc</span>
                    </div>
                    <div style={{ height: 6, background: '#F0E9DC', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${(p.revenue / max) * 100}%`, background: GOLD, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Status breakdown */}
      <Card>
        <SectionTitle>Order status breakdown</SectionTitle>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ background: '#FAF7F0', border: '1px solid #F0E9DC', borderRadius: '4px', padding: '10px 16px', fontSize: '13px' }}>
              <span style={{ textTransform: 'capitalize', color: '#1A0F0A', fontWeight: 500 }}>{status.replace(/_/g, ' ')}</span>
              <span style={{ color: '#C49B38', fontWeight: 700, marginLeft: '8px' }}>{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, gold }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E0D0B8', borderRadius: '6px', padding: '18px 20px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9C7B5E', marginBottom: '8px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '30px', fontWeight: 700, color: gold ? '#C49B38' : '#1A0F0A', lineHeight: 1 }}>{value}</div>
    </div>
  );
}
