'use client';

import { useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm';

export default function EditProductPage({ params }) {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setInitialData(data.product);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ padding: '32px', fontFamily: '"Josefin Sans", sans-serif', color: '#6B5E54' }}>
        Loading product...
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div style={{ padding: '32px', fontFamily: '"Josefin Sans", sans-serif', color: '#C8726A' }}>
        {error || 'Product not found.'}
      </div>
    );
  }

  return <ProductForm initialData={initialData} />;
}
