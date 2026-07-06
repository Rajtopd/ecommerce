import { supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import SortSelect from '@/components/product/SortSelect'
import Link from 'next/link'

export const revalidate = 0 // Dynamic due to searchParams

export default async function ShopPage({ searchParams }) {
  const { category, size, sort, page } = searchParams

  const pageNum = parseInt(page) || 1
  const limitNum = 12
  const from = (pageNum - 1) * limitNum
  const to = from + limitNum - 1

  // Start query
  // Using !inner for product_variants allows us to filter the parent table based on the child table
  let selectQuery = '*, product_variants(*)'
  if (size) {
    selectQuery = '*, product_variants!inner(*)'
  }

  let query = supabaseAdmin
    .from('products')
    .select(selectQuery, { count: 'exact' })
    .eq('is_active', true)

  // Filters
  if (category) {
    query = query.eq('category', category)
  }

  if (size) {
    query = query.eq('product_variants.size', size).gt('product_variants.stock_quantity', 0)
  }

  if (sort === 'sale') {
    query = query.not('sale_price', 'is', null)
  }

  // Sorting
  if (sort === 'price_asc') {
    query = query.order('base_price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('base_price', { ascending: false })
  } else {
    // newest (default) or sale
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  query = query.range(from, to)

  const [{ data: products, count, error }, { data: dbCategories }] = await Promise.all([
    query,
    supabaseAdmin.from('categories').select('name').eq('is_active', true).order('sort_order'),
  ])

  const totalPages = Math.ceil((count || 0) / limitNum)

  const categories = ['All', ...(dbCategories?.length ? dbCategories.map(c => c.name) : ['Tops', 'Bottoms', 'Dresses', 'Co-ords', 'Outerwear', 'Accessories'])]
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

  const getUpdatedUrl = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'All' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // reset to page 1 on filter change
    if (key !== 'page') params.delete('page')
    
    return `/shop?${params.toString()}`
  }

  const clearAllUrl = '/shop'
  const hasFilters = category || size || sort

  return (
    <div className="bg-brand-bg min-h-screen pt-8 md:pt-12 pb-20">
      
      {/* Page Header (Full Width) */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-6 md:mb-10">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="font-display text-[32px] md:text-[42px] font-bold text-brand-dark">{category || 'Shop All'}</h1>
          <span className="text-[14px] text-brand-muted font-light">
            ({count || 0} pieces)
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div className="text-[13px] text-brand-muted">
            Viewing {products?.length || 0} of {count || 0} results
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SortSelect currentSort={sort} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8">

        {/* Filters — collapsible on mobile, sidebar on desktop */}
        <div className="w-full md:w-[240px] flex-shrink-0 md:pr-6 md:border-r border-brand-border">

          {/* Mobile: collapsed by default */}
          <details className="md:hidden border border-brand-border rounded-[3px] bg-white mb-2 group">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="text-[13px] font-semibold text-brand-dark uppercase tracking-[0.08em]">
                Filters {hasFilters && <span className="text-brand-accent">·</span>}
              </span>
              <svg className="transition-transform duration-200 group-open:rotate-180" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-brand-border">
              <FilterPanel
                categories={categories} sizes={sizes}
                category={category} size={size}
                hasFilters={hasFilters} clearAllUrl={clearAllUrl}
                getUpdatedUrl={getUpdatedUrl}
              />
            </div>
          </details>

          {/* Desktop: always visible */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-brand-dark">Filters</h2>
              {hasFilters && (
                <a href={clearAllUrl} className="text-brand-accent text-[11px] uppercase tracking-[0.1em] font-medium hover:underline">
                  Clear all
                </a>
              )}
            </div>
            <FilterPanel
              categories={categories} sizes={sizes}
              category={category} size={size}
              hasFilters={hasFilters} clearAllUrl={clearAllUrl}
              getUpdatedUrl={getUpdatedUrl}
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 md:pl-2">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-20 text-center flex flex-col items-center border border-brand-border border-dashed rounded-md bg-white/50">
              <h3 className="font-display text-[22px] text-brand-dark mb-2">No pieces found.</h3>
              <p className="text-[13px] text-brand-muted font-light mb-6">Try adjusting your filters.</p>
              <a href={clearAllUrl} className="bg-brand-accent text-white px-[26px] py-[11px] text-[10px] uppercase tracking-[0.12em] font-medium rounded-sm hover:opacity-90 transition-opacity">
                Clear filters
              </a>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 pt-8 border-t border-brand-border flex justify-center items-center gap-2">
              {pageNum > 1 && (
                <a href={getUpdatedUrl('page', pageNum - 1)} className="px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-brand-muted hover:text-brand-dark">
                  Prev
                </a>
              )}
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1
                const isActive = p === pageNum
                return (
                  <a 
                    key={p} 
                    href={getUpdatedUrl('page', p)}
                    className={`w-8 h-8 flex items-center justify-center text-[12px] transition-colors ${
                      isActive 
                        ? 'font-bold text-brand-dark border-b-2 border-brand-dark' 
                        : 'text-brand-muted hover:text-brand-dark'
                    }`}
                  >
                    {p}
                  </a>
                )
              })}

              {pageNum < totalPages && (
                <a href={getUpdatedUrl('page', pageNum + 1)} className="px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-brand-muted hover:text-brand-dark">
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPanel({ categories, sizes, category, size, hasFilters, clearAllUrl, getUpdatedUrl }) {
  return (
    <>
      {/* Active Filters display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6 mt-3 md:mt-0">
          {category && (
            <a href={getUpdatedUrl('category', 'All')} className="bg-white border border-brand-border text-brand-dark px-3 py-1 text-[10px] uppercase tracking-[0.08em] rounded-sm flex items-center gap-2 hover:border-brand-accent transition-colors">
              {category} &times;
            </a>
          )}
          {size && (
            <a href={getUpdatedUrl('size', 'All')} className="bg-white border border-brand-border text-brand-dark px-3 py-1 text-[10px] uppercase tracking-[0.08em] rounded-sm flex items-center gap-2 hover:border-brand-accent transition-colors">
              Size: {size} &times;
            </a>
          )}
        </div>
      )}

      <div className="mb-6 mt-3 md:mt-0">
        <div className="text-[13px] font-semibold text-brand-dark mb-3">Category</div>
        <div className="flex flex-col gap-2">
          {categories.map((c) => {
            const isActive = category === c || (c === 'All' && !category)
            return (
              <a
                key={c}
                href={getUpdatedUrl('category', c)}
                className={`text-[13px] flex items-center gap-2 cursor-pointer ${
                  isActive ? 'text-brand-accent font-medium' : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                <div className={`w-3.5 h-3.5 border ${isActive ? 'border-brand-accent bg-brand-accent' : 'border-brand-border bg-white'} rounded-sm flex items-center justify-center`}>
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>}
                </div>
                {c}
              </a>
            )
          })}
        </div>
      </div>

      <div className="h-[1px] bg-brand-border mb-6"></div>

      <div className="mb-2 md:mb-6">
        <div className="text-[13px] font-semibold text-brand-dark mb-3">Size</div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const isActive = size === s || (s === 'All' && !size)
            return (
              <a
                key={s}
                href={getUpdatedUrl('size', s)}
                className={`w-[38px] h-[38px] flex items-center justify-center text-[12px] font-medium border cursor-pointer transition-colors ${
                  isActive
                    ? 'border-brand-accent bg-brand-accent text-white'
                    : 'border-brand-border bg-white text-brand-muted hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {s}
              </a>
            )
          })}
        </div>
      </div>

      {hasFilters && (
        <a href={clearAllUrl} className="md:hidden inline-block text-brand-accent text-[11px] uppercase tracking-[0.1em] font-medium hover:underline mb-2">
          Clear all filters
        </a>
      )}
    </>
  )
}
