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
    <div className="pt-24 pb-20 px-5 md:px-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Product Top Section */}
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

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-[24px] text-[#1C1410] mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
