import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ProductGallery from '@/components/product/ProductGallery'
import ProductActions from '@/components/product/ProductActions'
import ProductCard from '@/components/product/ProductCard'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = params
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!product) {
    return { title: 'Product Not Found — Soul Sisters' }
  }

  return {
    title: `${product.name} — Soul Sisters`,
    description: product.description ? product.description.slice(0, 155) : '',
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = params

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    redirect('/shop')
  }

  // Fetch related products (same category, exclude current)
  const { data: relatedProducts } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="bg-brand-bg min-h-screen">
      
      {/* Product Top Section */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8 -mt-2 md:-mt-6">
          <ol className="flex items-center flex-wrap gap-1.5 text-[11px] uppercase tracking-[0.1em] text-brand-muted">
            <li><a href="/" className="hover:text-brand-accent transition-colors">Home</a></li>
            <li aria-hidden="true" className="text-brand-border">/</li>
            <li><a href="/shop" className="hover:text-brand-accent transition-colors">Shop</a></li>
            <li aria-hidden="true" className="text-brand-border">/</li>
            <li><a href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-accent transition-colors">{product.category}</a></li>
            <li aria-hidden="true" className="text-brand-border">/</li>
            <li aria-current="page" className="text-brand-dark normal-case tracking-normal font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          
          {/* LEFT - Image Gallery */}
          <div className="w-full md:w-[55%]">
            <ProductGallery images={product.images || []} />
          </div>

          {/* RIGHT - Product Info */}
          <div className="w-full md:w-[45%]">
            <div className="sticky top-[100px]">
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-[#F2EAD8] py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8">
            <h2 className="font-display text-[32px] md:text-[38px] font-semibold text-brand-dark mb-2">You May Also Love</h2>
            <div className="h-[1px] bg-gradient-to-r from-brand-gold to-transparent mb-8"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
