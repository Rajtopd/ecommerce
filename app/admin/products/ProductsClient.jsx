'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const router = useRouter();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Client-side filtering
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'All' 
      ? true 
      : statusFilter === 'Active' ? p.is_active : !p.is_active;
    
    return matchSearch && matchCategory && matchStatus;
  });

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setProducts(products.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
    
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      router.refresh();
    } catch (err) {
      // Revert on error
      setProducts(products.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  return (
    <div>
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '24px',
          color: '#1C1410',
          margin: 0
        }}>
          Products ({filteredProducts.length})
        </h1>
        <Link href="/admin/products/new" style={{
          backgroundColor: '#C8726A',
          color: '#fff',
          borderRadius: '2px',
          fontFamily: '"Josefin Sans", sans-serif',
          fontWeight: 400,
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '10px 20px',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* FILTER / SEARCH BAR */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            height: '38px',
            border: '0.5px solid #E8E4DF',
            borderRadius: '2px',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 300,
            fontSize: '12px',
            padding: '0 14px',
            width: '280px',
            outline: 'none'
          }}
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            height: '38px',
            border: '0.5px solid #E8E4DF',
            borderRadius: '2px',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 300,
            fontSize: '12px',
            padding: '0 14px',
            width: '180px',
            outline: 'none',
            backgroundColor: '#fff'
          }}
        >
          {['All Categories', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: '38px',
            border: '0.5px solid #E8E4DF',
            borderRadius: '2px',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 300,
            fontSize: '12px',
            padding: '0 14px',
            width: '180px',
            outline: 'none',
            backgroundColor: '#fff'
          }}
        >
          {['All', 'Active', 'Inactive'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* PRODUCTS TABLE */}
      <div style={{
        backgroundColor: '#fff',
        border: '0.5px solid #E8E4DF',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '20px',
              color: '#1C1410',
              marginBottom: '16px'
            }}>
              No products yet
            </div>
            <Link href="/admin/products/new" style={{
              backgroundColor: '#C8726A',
              color: '#fff',
              borderRadius: '2px',
              fontFamily: '"Josefin Sans", sans-serif',
              fontWeight: 400,
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '10px 20px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Plus size={14} /> Add Product
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                backgroundColor: '#F7F6F3',
                borderBottom: '0.5px solid #E8E4DF',
              }}>
                {['Image', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    fontFamily: '"Josefin Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6B5E54',
                    padding: '10px 16px',
                    textAlign: 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
                
                let stockColor = '#2E7D5E';
                if (totalStock === 0) stockColor = '#C0392B';
                else if (totalStock <= 10) stockColor = '#B8860B';

                return (
                  <tr key={product.id} style={{ borderBottom: '0.5px solid #E8E4DF' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F7F6F3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{
                        width: '48px', height: '60px',
                        borderRadius: '4px',
                        backgroundColor: '#F2EDE8',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {product.images?.[0] && (
                          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '13px', color: '#1C1410' }}>
                        {product.name}
                      </div>
                      <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '9px', color: '#B5A89E' }}>
                        {product.slug}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#6B5E54' }}>
                      {product.category}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '12px' }}>
                      {product.sale_price ? (
                        <>
                          <span style={{ color: '#C8726A' }}>د.إ {(product.sale_price / 100).toFixed(2)}</span>
                          <br />
                          <span style={{ color: '#B5A89E', fontSize: '10px', textDecoration: 'line-through' }}>
                            د.إ {(product.base_price / 100).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#1C1410' }}>د.إ {(product.base_price / 100).toFixed(2)}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '11px', color: stockColor }}>
                      {totalStock === 0 ? 'Out of stock' : `${totalStock} units`}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        style={{
                          backgroundColor: product.is_active ? '#2E7D5E' : '#B5A89E',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '4px 8px',
                          fontFamily: '"Josefin Sans", sans-serif',
                          fontWeight: 400,
                          fontSize: '8px',
                          textTransform: 'uppercase',
                          cursor: 'pointer'
                        }}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href={`/admin/products/${product.id}`} style={{
                          textDecoration: 'none',
                          color: '#6B5E54',
                          fontFamily: '"Josefin Sans", sans-serif',
                          fontWeight: 400,
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Pencil size={13} /> Edit
                        </Link>
                        <button onClick={() => handleDelete(product.id, product.name)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#C8726A',
                          fontFamily: '"Josefin Sans", sans-serif',
                          fontWeight: 400,
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: 0
                        }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
