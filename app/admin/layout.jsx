'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut } from 'lucide-react';
import Link from 'next/link';
import '../globals.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

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
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  // Helper to format pathname as a simple title
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/products/new')) return 'Add Product';
    if (pathname.match(/^\/admin\/products\/[^/]+$/)) return 'Edit Product';
    if (pathname.startsWith('/admin/products')) return 'Products';
    if (pathname.startsWith('/admin/orders')) return 'Orders';
    if (pathname.startsWith('/admin/analytics')) return 'Analytics';
    return 'Admin Panel';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* LEFT — AdminSidebar */}
      <div style={{
        backgroundColor: '#1C1410',
        width: '240px',
        height: '100vh',
        padding: '28px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '16px',
          color: '#FAF7F4',
          letterSpacing: '0.08em',
          padding: '0 24px',
          marginBottom: '6px'
        }}>
          Soul Sisters
        </div>
        <div style={{
          fontFamily: '"Josefin Sans", sans-serif',
          fontWeight: 400,
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#6B5E54',
          padding: '0 24px',
          marginBottom: '32px'
        }}>
          Admin Panel
        </div>

        <div style={{ borderBottom: '0.5px solid #2D1F18', width: '100%' }}></div>

        <div style={{
          fontFamily: '"Josefin Sans", sans-serif',
          fontWeight: 400,
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#4A3D35',
          padding: '16px 24px 8px'
        }}>
          MANAGE
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {navLinks.map((link) => {
            // exact match for /admin, startsWith for others
            const isActive = link.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(link.href);
            
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 24px',
                  width: '100%',
                  boxSizing: 'border-box',
                  fontFamily: '"Josefin Sans", sans-serif',
                  fontWeight: 400,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isActive ? '#FAF7F4' : '#B5A89E',
                  backgroundColor: isActive ? '#2D1F18' : 'transparent',
                  borderLeft: isActive ? '2px solid #C8726A' : '2px solid transparent',
                  transition: 'background-color 150ms, color 150ms'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#2D1F18';
                    e.currentTarget.style.color = '#FAF7F4';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#B5A89E';
                  }
                }}>
                  <Icon size={16} />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ borderBottom: '0.5px solid #2D1F18', width: '100%' }}></div>
        
        <button onClick={handleSignOut} style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 24px',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6B5E54',
          fontFamily: '"Josefin Sans", sans-serif',
          fontWeight: 400,
          fontSize: '10px',
          textTransform: 'uppercase',
          marginTop: '16px'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#C8726A'}
        onMouseOut={(e) => e.currentTarget.style.color = '#6B5E54'}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* RIGHT — Main content area */}
      <div style={{
        marginLeft: '240px',
        minHeight: '100vh',
        backgroundColor: '#F7F6F3',
        padding: 0,
        width: 'calc(100% - 240px)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          height: '56px',
          backgroundColor: '#fff',
          borderBottom: '0.5px solid #E8E4DF',
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 400,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#1C1410'
          }}>
            {getPageTitle()}
          </div>
          <div style={{
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 300,
            fontSize: '9px',
            color: '#B5A89E'
          }}>
            soul sisters admin
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
