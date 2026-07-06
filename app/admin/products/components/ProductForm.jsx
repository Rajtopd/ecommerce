'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImagePlus, X, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

const DEFAULT_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Co-ords', 'Outerwear', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const isEdit = !!initialData;

  // Categories are admin-managed; fall back to defaults while loading
  const [CATEGORIES, setCategories] = useState(DEFAULT_CATEGORIES);
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.categories?.length) setCategories(d.categories.map(c => c.name)); })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    material: initialData?.material || '',
    care_instructions: initialData?.care_instructions || '',
    category: initialData?.category || CATEGORIES[0],
    base_price: initialData ? (initialData.base_price / 100).toString() : '',
    sale_price: initialData?.sale_price ? (initialData.sale_price / 100).toString() : '',
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    tags: initialData?.tags?.join(', ') || '',
    images: initialData?.images || [],
  });

  const [variants, setVariants] = useState(
    initialData?.product_variants?.length > 0 
      ? initialData.product_variants 
      : [{ size: 'S', color: '', color_hex: '#000000', sku: '', stock_quantity: 0 }]
  );

  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug on name blur
  const handleNameBlur = () => {
    if (!formData.slug && formData.name) {
      const generated = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: generated }));
    }
  };

  const handleImageUpload = (result) => {
    if (result.event === 'success') {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.info.secure_url].slice(0, 8)
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    
    // Auto-suggest SKU if color and size are present and SKU is empty
    if ((field === 'color' || field === 'size') && !newVariants[index].sku) {
      const colorAbbr = (newVariants[index].color || '').substring(0, 3).toUpperCase();
      if (colorAbbr && newVariants[index].size) {
        newVariants[index].sku = `SS-${colorAbbr}-${newVariants[index].size}`;
      }
    }
    
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: 'S', color: '', color_hex: '#000000', sku: '', stock_quantity: 0 }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (isActive) => {
    if (!formData.name || !formData.category || !formData.base_price) {
      alert('Please fill out all required fields (Name, Category, Base Price)');
      return;
    }
    if (variants.length === 0) {
      alert('At least one variant is required');
      return;
    }

    setIsSaving(true);
    const payload = {
      ...formData,
      base_price: Math.round(parseFloat(formData.base_price) * 100),
      sale_price: formData.sale_price ? Math.round(parseFloat(formData.sale_price) * 100) : null,
      is_active: isActive,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      variants: variants.map(v => ({
        ...v,
        stock_quantity: parseInt(v.stock_quantity, 10) || 0
      }))
    };

    try {
      const url = isEdit ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.location.href = '/admin/products';
      } else {
        const data = await res.json();
        let errMsg = data.error || 'Failed to save product';
        if (errMsg.includes('products_slug_key')) errMsg = 'A product with this URL slug already exists. Please change the slug.';
        if (errMsg.includes('product_variants_sku_key')) errMsg = 'A variant with this SKU already exists. SKUs must be unique.';
        alert(errMsg);
      }
    } catch (err) {
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${formData.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${initialData.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('An error occurred while deleting.');
    }
  };

  // Shared input style
  const inputStyle = {
    width: '100%',
    height: '46px',
    border: '0.5px solid #E8E4DF',
    borderRadius: '2px',
    fontFamily: '"Josefin Sans", sans-serif',
    fontWeight: 300,
    fontSize: '13px',
    padding: '0 16px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff'
  };

  const labelStyle = {
    fontFamily: '"Josefin Sans", sans-serif',
    fontWeight: 400,
    fontSize: '9px',
    textTransform: 'uppercase',
    color: '#6B5E54',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div>
      <Link href="/admin/products" style={{
        fontFamily: '"Josefin Sans", sans-serif',
        fontWeight: 400,
        fontSize: '9px',
        textTransform: 'uppercase',
        color: '#6B5E54',
        textDecoration: 'none',
        display: 'inline-block',
        marginBottom: '16px'
      }}>
        ← Products
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: '#1C1410', margin: 0 }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        {isEdit && (
          <button onClick={handleDelete} style={{
            border: '0.5px solid #C8726A',
            color: '#C8726A',
            backgroundColor: 'transparent',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 400,
            fontSize: '9px',
            textTransform: 'uppercase',
            padding: '8px 16px',
            borderRadius: '2px',
            cursor: 'pointer'
          }}>
            Delete Product
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* LEFT COLUMN - FORM */}
        <div style={{ flex: '1 1 60%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* SECTION A — Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                style={inputStyle}
                placeholder="e.g. White Linen Midi Dress"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                onBlur={handleNameBlur}
              />
            </div>
            
            <div>
              <label style={labelStyle}>Slug *</label>
              <input
                style={inputStyle}
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
              <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#B5A89E', marginTop: '4px' }}>
                URL: /product/{formData.slug || '[slug]'}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <select
                style={inputStyle}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, height: 'auto', padding: '12px 16px' }}
                rows={4}
                placeholder="Describe the product..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Material</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 100% Linen"
                  value={formData.material}
                  onChange={e => setFormData({ ...formData, material: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Care Instructions</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Hand wash cold"
                  value={formData.care_instructions}
                  onChange={e => setFormData({ ...formData, care_instructions: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION B — Pricing */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Base Price (AED) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                placeholder="0.00"
                value={formData.base_price}
                onChange={e => setFormData({ ...formData, base_price: e.target.value })}
              />
              <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#B5A89E', marginTop: '4px' }}>
                Stored internally in fils
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sale Price (AED) — optional</label>
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                placeholder="Leave empty if not on sale"
                value={formData.sale_price}
                onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
              />
            </div>
          </div>

          {/* SECTION C — Images */}
          <div>
            <h3 style={{ ...labelStyle, fontSize: '9px', marginBottom: '16px' }}>Product Images</h3>
            
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "soul_sisters_products"}
              onSuccess={handleImageUpload}
              options={{ multiple: true, maxFiles: 8, clientAllowedFormats: ['jpg', 'png', 'webp'] }}
            >
              {({ open }) => (
                <div 
                  onClick={() => open()}
                  style={{
                    border: '1.5px dashed #E8E4DF',
                    borderRadius: '4px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#FAFAF8',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#1C1410'; e.currentTarget.style.backgroundColor = '#F7F6F3'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E4DF'; e.currentTarget.style.backgroundColor = '#FAFAF8'; }}
                >
                  <ImagePlus size={24} color="#B5A89E" style={{ margin: '0 auto' }} />
                  <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '16px', color: '#6B5E54', marginTop: '8px' }}>
                    Click to upload images
                  </div>
                  <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#B5A89E', marginTop: '4px' }}>
                    JPG, PNG, WEBP · Max 8 images
                  </div>
                </div>
              )}
            </CldUploadWidget>

            {formData.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px' }}>
                {formData.images.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: '100%', aspectRatio: '80/100', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={url} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(28,20,16,0.7)',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        backgroundColor: 'rgba(28,20,16,0.7)',
                        color: '#fff',
                        fontFamily: '"Josefin Sans", sans-serif',
                        fontWeight: 400,
                        fontSize: '7px',
                        textTransform: 'uppercase',
                        padding: '3px 0',
                        textAlign: 'center'
                      }}>
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION D — Variants */}
          <div>
            <h3 style={{ ...labelStyle, fontSize: '9px', marginBottom: '8px' }}>Sizes & Stock</h3>
            <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#B5A89E', marginBottom: '16px' }}>
              Add at least one variant to publish this product.
            </div>

            {variants.map((variant, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                backgroundColor: '#fff',
                border: '0.5px solid #E8E4DF',
                borderRadius: '4px',
                padding: '14px',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Size</label>
                  <select style={inputStyle} value={variant.size} onChange={e => updateVariant(i, 'size', e.target.value)}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={labelStyle}>Colour</label>
                  <input style={inputStyle} placeholder="e.g. White" value={variant.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Hex</label>
                  <input type="color" style={{ ...inputStyle, width: '46px', height: '38px', padding: '2px' }} value={variant.color_hex} onChange={e => updateVariant(i, 'color_hex', e.target.value)} />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={labelStyle}>SKU</label>
                  <input style={inputStyle} placeholder="SS-WHT-S" value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Stock</label>
                  <input type="number" min="0" style={inputStyle} placeholder="0" value={variant.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} />
                </div>
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', color: '#B5A89E' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <button onClick={addVariant} style={{
              width: '100%',
              border: '0.5px dashed #E8E4DF',
              backgroundColor: 'transparent',
              padding: '10px',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              color: '#B5A89E',
              fontFamily: '"Josefin Sans", sans-serif',
              fontWeight: 400,
              fontSize: '9px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: '8px'
            }}>
              <Plus size={14} /> Add Variant
            </button>
          </div>

          {/* SECTION E — Settings */}
          <div>
            <h3 style={{ ...labelStyle, fontSize: '9px', marginBottom: '16px' }}>Settings</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                <div>
                  <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '13px', color: '#1C1410' }}>Publish product</div>
                  <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#6B5E54' }}>Active products are visible to customers</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                <div>
                  <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '13px', color: '#1C1410' }}>Feature on homepage</div>
                  <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#6B5E54' }}>Shows in the Featured Pieces section</div>
                </div>
              </label>

              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. summer, linen, new-arrival"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              style={{
                border: '0.5px solid #E8E4DF',
                backgroundColor: '#fff',
                fontFamily: '"Josefin Sans", sans-serif',
                fontWeight: 400,
                fontSize: '9px',
                textTransform: 'uppercase',
                color: '#6B5E54',
                padding: '11px 24px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              style={{
                backgroundColor: '#C8726A',
                color: '#fff',
                border: 'none',
                fontFamily: '"Josefin Sans", sans-serif',
                fontWeight: 400,
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '11px 24px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              {isEdit ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - LIVE PREVIEW */}
        <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase', color: '#6B5E54', marginBottom: '16px' }}>
              Preview
            </div>
            
            {/* Minimal ProductCard Preview matching design system */}
            <div style={{ width: '100%', maxWidth: '300px', backgroundColor: '#fff', padding: '16px', border: '0.5px solid #E8E4DF', borderRadius: '4px' }}>
              <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#F2EDE8', position: 'relative', marginBottom: '16px' }}>
                {formData.images[0] && (
                  <img src={formData.images[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '18px', color: '#1C1410', marginBottom: '4px' }}>
                {formData.name || 'Product Name'}
              </div>
              <div style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 400, fontSize: '14px', marginBottom: '12px' }}>
                {formData.sale_price ? (
                  <>
                    <span style={{ color: '#C8726A', marginRight: '8px' }}>د.إ {formData.sale_price}</span>
                    <span style={{ color: '#B5A89E', textDecoration: 'line-through', fontSize: '12px' }}>د.إ {formData.base_price || '0.00'}</span>
                  </>
                ) : (
                  <span style={{ color: '#1C1410' }}>د.إ {formData.base_price || '0.00'}</span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[...new Set(variants.map(v => v.size).filter(Boolean))].map(size => (
                  <div key={size} style={{
                    border: '0.5px solid #E8E4DF',
                    padding: '4px 8px',
                    fontFamily: '"Josefin Sans", sans-serif',
                    fontSize: '10px',
                    color: '#6B5E54'
                  }}>
                    {size}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
