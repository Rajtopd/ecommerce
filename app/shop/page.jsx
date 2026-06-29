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

  const { data: products, count, error } = await query

  const totalPages = Math.ceil((count || 0) / limitNum)

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Co-ords', 'Outerwear', 'Accessories']
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
    <div className="pt-24 pb-20 px-5 md:px-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Page Header */}
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-display text-[36px] text-[#1C1410]">Shop</h1>
        <span className="text-[14px] text-[#6B5E54] font-light">
          ({count || 0} pieces)
        </span>
      </div>

      {/* Filter Bar */}
      <div className="mb-10 flex flex-col gap-4">
        
        {/* Sort & active filters row - visually above categories on mobile, right aligned on desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 order-3 md:order-1">
          <div className="flex flex-wrap gap-2 items-center">
            {hasFilters && (
              <>
                {category && (
                  <a href={getUpdatedUrl('category', 'All')} className="bg-[#F2EDE8] text-[#1C1410] px-3 py-1 text-[9px] uppercase tracking-[0.1em] rounded-[2px] flex items-center gap-2">
                    {category} &times;
                  </a>
                )}
                {size && (
                  <a href={getUpdatedUrl('size', 'All')} className="bg-[#F2EDE8] text-[#1C1410] px-3 py-1 text-[9px] uppercase tracking-[0.1em] rounded-[2px] flex items-center gap-2">
                    Size: {size} &times;
                  </a>
                )}
                {sort && (
                  <a href={getUpdatedUrl('sort', 'All')} className="bg-[#F2EDE8] text-[#1C1410] px-3 py-1 text-[9px] uppercase tracking-[0.1em] rounded-[2px] flex items-center gap-2">
                    Sort: {sort === 'price_asc' ? 'Low-High' : sort === 'price_desc' ? 'High-Low' : 'Sale'} &times;
                  </a>
                )}
                <a href={clearAllUrl} className="text-[#C8726A] text-[9px] uppercase tracking-[0.1em] ml-2 hover:opacity-70">
                  Clear all
                </a>
              </>
            )}
          </div>
          
          <div className="relative">
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-row flex-wrap gap-2 order-1 md:order-2">
          {categories.map((c) => {
            const isActive = category === c || (c === 'All' && !category)
            return (
              <a 
                key={c}
                href={getUpdatedUrl('category', c)}
                className={`px-[14px] py-[7px] rounded-[2px] text-[9px] uppercase tracking-[0.1em] transition-colors ${
                  isActive ? 'bg-[#1C1410] text-white' : 'bg-[#F2EDE8] text-[#6B5E54] hover:bg-[#E8E4DF]'
                }`}
              >
                {c}
              </a>
            )
          })}
        </div>

        {/* Sizes */}
        <div className="flex flex-row flex-wrap gap-2 order-2 md:order-3">
          {sizes.map((s) => {
            const isActive = size === s || (s === 'All' && !size)
            return (
              <a 
                key={s}
                href={getUpdatedUrl('size', s)}
                className={`px-[14px] py-[7px] rounded-[2px] text-[9px] uppercase tracking-[0.1em] transition-colors ${
                  isActive ? 'bg-[#1C1410] text-white' : 'bg-[#F2EDE8] text-[#6B5E54] hover:bg-[#E8E4DF]'
                }`}
              >
                {s}
              </a>
            )
          })}
        </div>
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center flex flex-col items-center">
          <h3 className="font-display text-[22px] text-[#1C1410] mb-2">No pieces found.</h3>
          <p className="text-[13px] text-[#6B5E54] font-light mb-6">Try adjusting your filters.</p>
          <a href={clearAllUrl} className="bg-[#1C1410] text-white px-[26px] py-[11px] text-[10px] uppercase tracking-[0.12em] rounded-[2px] hover:opacity-90">
            Clear filters
          </a>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-2">
          {pageNum > 1 && (
            <a href={getUpdatedUrl('page', pageNum - 1)} className="px-3 py-1 text-[10px] text-[#6B5E54] hover:text-[#1C1410]">
              Previous
            </a>
          )}
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            const isActive = p === pageNum
            return (
              <a 
                key={p} 
                href={getUpdatedUrl('page', p)}
                className={`w-8 h-8 flex items-center justify-center rounded-[2px] text-[10px] transition-colors ${
                  isActive ? 'bg-[#1C1410] text-white' : 'bg-[#F2EDE8] text-[#6B5E54] hover:bg-[#E8E4DF]'
                }`}
              >
                {p}
              </a>
            )
          })}

          {pageNum < totalPages && (
            <a href={getUpdatedUrl('page', pageNum + 1)} className="px-3 py-1 text-[10px] text-[#6B5E54] hover:text-[#1C1410]">
              Next
            </a>
          )}
        </div>
      )}

    </div>
  )
}


