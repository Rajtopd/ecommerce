'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect({ currentSort }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (e) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    
    params.delete('page')
    
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <select 
      className="appearance-none bg-transparent border-b-[0.5px] border-[#1C1410] text-[#1C1410] text-[10px] uppercase tracking-[0.1em] py-2 pr-6 cursor-pointer focus:outline-none"
      value={currentSort || 'newest'}
      onChange={handleSortChange}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low–High</option>
      <option value="price_desc">Price: High–Low</option>
      <option value="sale">On Sale</option>
    </select>
  )
}
