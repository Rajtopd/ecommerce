import { supabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import { Shirt, Scissors, Sparkles, LayoutGrid, Wind, Gem } from 'lucide-react'

// Revalidate every 60 seconds or make dynamic
export const revalidate = 60

export default async function Homepage() {
  // Fetch featured products
  const { data: featuredProducts } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="relative w-full min-h-screen bg-[#1C1410] flex flex-col md:flex-row">
        
        {/* Left column */}
        <div className="w-full md:w-[60%] flex flex-col justify-center px-10 pt-32 pb-20 md:py-0 z-10">
          <div className="max-w-xl mx-auto md:mx-0 w-full">
            <h2 className="text-[9px] uppercase tracking-[0.18em] text-[#C8726A] mb-[14px]">
              New Season &middot; Dubai
            </h2>
            <h1 className="font-display text-[38px] md:text-[64px] text-[#FAF7F4] leading-[1.05]">
              Dress the <span className="font-display-italic text-[#C8726A]">Woman</span> You Are
            </h1>
            <p className="text-[12px] text-[#B5A89E] font-light leading-[1.7] mt-4 max-w-sm">
              Contemporary women&apos;s fashion crafted for Dubai&apos;s modern lifestyle.
            </p>
            
            <div className="flex flex-row gap-4 mt-7">
              <a 
                href="/shop" 
                className="bg-[#C8726A] text-white text-[10px] uppercase tracking-[0.12em] px-[26px] py-[11px] rounded-[2px] hover:opacity-90 transition-opacity"
              >
                Shop Now
              </a>
              <a 
                href="/shop?sort=newest" 
                className="bg-transparent border-[0.5px] border-[#B5A89E] text-[#FAF7F4] text-[10px] uppercase tracking-[0.12em] px-[26px] py-[11px] rounded-[2px] hover:bg-white/5 transition-colors"
              >
                New Arrivals
              </a>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="hidden md:flex w-[40%] flex-col justify-center items-center relative z-10">
          <div className="flex flex-row gap-6 items-end">
            <div className="flex flex-col items-center">
              <div className="w-[110px] h-[150px] bg-[#2D1F18] rounded-[4px]"></div>
              <span className="text-[8px] uppercase tracking-[0.1em] text-[#B5A89E] mt-3">New In</span>
            </div>
            
            <div className="flex flex-col items-center mb-[28px]">
              <div className="w-[80px] h-[110px] bg-[#3D2820] rounded-[4px]"></div>
              <span className="text-[8px] uppercase tracking-[0.1em] text-[#B5A89E] mt-3">Sale</span>
            </div>
          </div>
        </div>

        {/* Sentinel div for Navbar IntersectionObserver */}
        <div id="hero-sentinel" className="absolute bottom-0 w-full h-[1px]"></div>
      </section>

      {/* SECTION 2 — Marquee Strip */}
      <section className="bg-[#C8726A] py-[9px] overflow-hidden whitespace-nowrap">
        <div className="marquee-track flex w-max items-center">
          <style>{`
            .marquee-track {
              animation: marquee 22s linear infinite;
            }
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
          <div className="flex items-center text-[9px] uppercase tracking-[0.15em] text-white">
            <span className="mx-4">Free shipping across Dubai &middot; New arrivals weekly &middot; Easy returns &middot; UAE VAT included &middot;</span>
            <span className="mx-4">Free shipping across Dubai &middot; New arrivals weekly &middot; Easy returns &middot; UAE VAT included &middot;</span>
            <span className="mx-4">Free shipping across Dubai &middot; New arrivals weekly &middot; Easy returns &middot; UAE VAT included &middot;</span>
            <span className="mx-4">Free shipping across Dubai &middot; New arrivals weekly &middot; Easy returns &middot; UAE VAT included &middot;</span>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Shop by Category */}
      <section className="py-12 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-display text-[28px] text-[#1C1410]">Shop by Category</h2>
          <a href="/shop" className="text-[10px] uppercase tracking-[0.1em] text-[#C8726A] hover:opacity-70 transition-opacity">
            View all &rarr;
          </a>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          <CategoryCard name="Tops" Icon={Shirt} />
          <CategoryCard name="Bottoms" Icon={Scissors} />
          <CategoryCard name="Dresses" Icon={Sparkles} />
          <CategoryCard name="Co-ords" Icon={LayoutGrid} />
          <CategoryCard name="Outerwear" Icon={Wind} />
          <CategoryCard name="Accessories" Icon={Gem} />
        </div>
      </section>

      {/* SECTION 4 — Featured Pieces */}
      <section className="py-12 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-display text-[28px] text-[#1C1410]">Featured Pieces</h2>
          <a href="/shop" className="text-[10px] uppercase tracking-[0.1em] text-[#C8726A] hover:opacity-70 transition-opacity">
            View all &rarr;
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts && featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SECTION 5 — Mid Banner */}
      <section className="mx-5 md:mx-10 mb-12 max-w-7xl xl:mx-auto bg-[#2D1F18] rounded-[6px] p-8 md:p-10 flex flex-col md:flex-row">
        
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-[9px] uppercase tracking-[0.18em] text-[#C8726A] mb-2.5">
            New Arrival
          </span>
          <h2 className="font-display text-[26px] text-[#FAF7F4] leading-[1.2] my-2.5">
            The Summer Edit is Here
          </h2>
          <p className="text-[11px] font-light text-[#B5A89E] leading-[1.7] mb-[18px] max-w-md">
            Lightweight fabrics, bold silhouettes. Explore the new season collection.
          </p>
          <div>
            <a 
              href="/shop?sort=newest" 
              className="inline-block bg-[#C8726A] text-white text-[10px] uppercase tracking-[0.12em] px-[26px] py-[11px] rounded-[2px] hover:opacity-90 transition-opacity"
            >
              Shop the Edit
            </a>
          </div>
        </div>

        <div className="flex-1 mt-8 md:mt-0 flex justify-center md:justify-end items-center pr-0 md:pr-10">
          <div className="flex gap-4 items-end">
            <div className="w-[90px] h-[120px] bg-[#3D2820] rounded-[4px]"></div>
            <div className="w-[110px] h-[150px] bg-[#4D3530] rounded-[4px] mb-4"></div>
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryCard({ name, Icon }) {
  return (
    <a 
      href={`/shop?category=${name}`}
      className="group bg-[#F2EDE8] hover:bg-[#1C1410] rounded-[4px] py-5 px-2.5 flex flex-col items-center justify-center transition-colors duration-200"
    >
      <Icon size={22} className="text-[#C8726A] mb-2" strokeWidth={1.5} />
      <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B5E54] group-hover:text-[#FAF7F4] transition-colors">
        {name}
      </span>
    </a>
  )
}
