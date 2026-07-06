'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut, ChevronLeft, Tags, PenSquare, Truck, TicketPercent, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../globals.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    fetch('/api/admin/auth')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.role) setRole(d.role); })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    // Fetch initial count
    const fetchCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingCount(count || 0);
    };
    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel('admin-sidebar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchCount(); // Re-fetch on any order change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  // If this is the login page, don't show the admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/content', label: 'Site Content', icon: PenSquare },
    { href: '/admin/delivery', label: 'Delivery', icon: Truck },
    { href: '/admin/discounts', label: 'Discounts', icon: TicketPercent },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    ...(role === 'owner' ? [{ href: '/admin/admins', label: 'Admins', icon: ShieldCheck }] : []),
  ];

  const sideW = expanded ? '220px' : '64px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0EBE1', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* ── SIDEBAR ── */}
      <div style={{
        width: sideW,
        background: '#FAF7F0',
        borderRight: '1px solid #E0D0B8',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 40,
        transition: 'width 0.2s ease'
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#6E1A2C', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E0D0B8', fontSize: '20px', fontWeight: 600, fontStyle: 'italic', lineHeight: 1 }}>S</span>
          </div>
          {expanded && (
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600, color: '#1A0F0A', whiteSpace: 'nowrap' }}>
              Soul Sisters
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navLinks.map((link) => {
            const isActive = link.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(link.href);
            
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: isActive ? '#E0D0B8' : 'transparent',
                  color: isActive ? '#1A0F0A' : '#9C7B5E',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                  {expanded && (
                    <span style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 500, flex: 1 }}>
                      {link.label}
                    </span>
                  )}
                  {link.label === 'Orders' && pendingCount > 0 && (
                    <div style={{
                      background: '#C49B38',
                      color: '#1A0F0A',
                      borderRadius: '50%',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Cormorant Garamond", serif',
                      fontWeight: 600,
                      fontSize: '10px',
                      padding: '0 4px',
                      marginLeft: expanded ? '0' : 'auto',
                      position: expanded ? 'relative' : 'absolute',
                      right: expanded ? 'auto' : '8px',
                      top: expanded ? 'auto' : '8px'
                    }}>
                      {pendingCount}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #E0D0B8' }}>
          {/* Sign Out */}
          <div onClick={handleSignOut} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '10px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#9C7B5E',
            marginBottom: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#1A0F0A'}
          onMouseOut={(e) => e.currentTarget.style.color = '#9C7B5E'}>
            <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {expanded && <span style={{ fontSize: '13px', whiteSpace: 'nowrap', fontWeight: 500 }}>Sign Out</span>}
          </div>
          
          {/* Collapse */}
          <div onClick={() => setExpanded(!expanded)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '9px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#9C7B5E'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#1A0F0A';
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#9C7B5E';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}>
            <ChevronLeft size={16} strokeWidth={2} style={{ flexShrink: 0, transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            {expanded && <span style={{ fontSize: '13px', whiteSpace: 'nowrap', fontWeight: 500 }}>Collapse</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        marginLeft: sideW,
        padding: '32px 36px',
        minHeight: '100vh',
        transition: 'margin-left 0.2s ease',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>

    </div>
  );
}
