import { supabaseAdmin } from '@/lib/supabase'
import Image from 'next/image'
import ProductCard from '@/components/product/ProductCard'
import HeroScrollEffect from '@/components/HeroScrollEffect'
import { getSiteData } from '@/lib/content'
import { Truck, Undo2, ShieldCheck, Sparkles } from 'lucide-react'

// Revalidate every 60 seconds or make dynamic
export const revalidate = 60

const USP_ICONS = { truck: Truck, undo: Undo2, shield: ShieldCheck, sparkles: Sparkles }

const DEFAULT_USP = [
  { icon: 'truck', title: 'Free Dubai Delivery', detail: 'On orders over د.إ 200' },
  { icon: 'undo', title: '7-Day Easy Returns', detail: 'No questions asked' },
  { icon: 'shield', title: 'Secure Checkout', detail: 'Powered by Stripe' },
  { icon: 'sparkles', title: 'Artisan Crafted', detail: '100+ artisans across India' },
]

const DEFAULT_STATS = [
  { value: '100+', label: 'Artisans' },
  { value: 'Premium', label: 'Fabrics' },
  { value: 'Bespoke', label: 'Tailoring' },
]

const CATEGORY_GRADIENTS = [
  'from-[#6E1A2C] to-[#B04060]', 'from-[#3D1542] to-[#7A3082]', 'from-[#1A4A3A] to-[#3A8A6A]',
  'from-[#7A3B1A] to-[#C47840]', 'from-[#1A1A6E] to-[#3A4AAE]', 'from-[#3D1C72] to-[#7A4CA2]',
]

export default async function Homepage() {
  // Fetch featured products + admin-managed site data
  const [{ data: featuredProducts }, siteData] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    getSiteData(),
  ])

  const { content, categories } = siteData
  const c = (key, fallback = '') => {
    const v = content?.[key]
    return v === undefined || v === null || v === '' ? fallback : v
  }

  const uspItems = Array.isArray(content['usp.items']) && content['usp.items'].length ? content['usp.items'] : DEFAULT_USP
  const storyStats = Array.isArray(content['story.stats']) && content['story.stats'].length ? content['story.stats'] : DEFAULT_STATS
  const storyHeadingLines = c('story.heading', 'Rooted in tradition,\ndesigned for today.').split('\n')

  return (
    <div className="bg-brand-bg min-h-screen overflow-x-hidden">
      {/* SECTION 1 — Hero */}
      <section id="hero-section" className="bg-gradient-to-br from-[#2C0A14] via-[#6E1A2C] to-[#8B2A3C] relative overflow-hidden min-h-[85vh] flex items-center">
        <HeroScrollEffect targetId="hero-section" />
        {/* Decorative Circles */}
        <div className="hero-circle-a absolute -right-[100px] -top-[100px] w-[520px] h-[520px] rounded-full border border-brand-gold/10 pointer-events-none"></div>
        <div className="hero-circle-b absolute -right-[40px] -top-[40px] w-[360px] h-[360px] rounded-full border border-brand-gold/10 pointer-events-none"></div>

        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="hero-rise flex items-center gap-3 mb-6" style={{ '--rise-delay': '0.05s' }}>
              <svg width="100" height="12" viewBox="0 0 100 12"><line x1="0" y1="6" x2="38" y2="6" stroke="#C49B38" strokeWidth="0.8"></line><rect x="42" y="2" width="8" height="8" fill="#C49B38" transform="rotate(45 46 6)"></rect><circle cx="3" cy="6" r="1.5" fill="#C49B38"></circle><circle cx="85" cy="6" r="1.5" fill="#C49B38"></circle><line x1="50" y1="6" x2="88" y2="6" stroke="#C49B38" strokeWidth="0.8"></line></svg>
              <span className="text-[10px] tracking-[0.28em] text-brand-gold uppercase whitespace-nowrap">{c('hero.badge', 'New Arrivals · Eid 2026')}</span>
            </div>
            <h1 className="font-display text-[48px] md:text-[72px] font-bold text-brand-bg leading-[1.06] mb-5">
              <span className="hero-line-mask">
                <span className="hero-line-inner" style={{ '--line-delay': '0.15s' }}>{c('hero.heading_line1', 'Dressed in')}</span>
              </span>
              <span className="hero-line-mask">
                <span className="hero-line-inner" style={{ '--line-delay': '0.32s' }}>
                  <span className="gold-sheen text-brand-gold italic font-light">{c('hero.heading_accent', 'Heritage,')}</span>
                </span>
              </span>
              <span className="hero-line-mask">
                <span className="hero-line-inner" style={{ '--line-delay': '0.49s' }}>{c('hero.heading_line3', 'Living Modern')}</span>
              </span>
            </h1>
            <p className="hero-rise text-[14px] md:text-[16px] text-brand-bg/70 max-w-[400px] leading-[1.65] mb-8 text-balance" style={{ '--rise-delay': '0.75s' }}>
              {c('hero.subtext', 'Curated Indian ethnic wear for the modern woman in Dubai. From bridal lehengas to everyday kurtis — your culture, beautifully worn.')}
            </p>
            <div className="hero-rise flex flex-wrap gap-4" style={{ '--rise-delay': '0.95s' }}>
              <a href={c('hero.cta_primary_href', '/shop')} className="bg-brand-gold text-brand-dark px-[26px] py-[12px] text-[11px] font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-[#E8C96A] transition-colors">
                {c('hero.cta_primary_label', 'Explore Collection')}
              </a>
              <a href={c('hero.cta_secondary_href', '/shop?sort=newest')} className="bg-transparent text-brand-bg px-[26px] py-[12px] text-[11px] font-medium tracking-[0.1em] uppercase border border-brand-bg/35 rounded-sm hover:border-brand-bg/85 transition-colors">
                {c('hero.cta_secondary_label', 'New Arrivals')} →
              </a>
            </div>
          </div>

          <div className="hero-parallax flex-shrink-0 relative mt-6 md:mt-0 mx-auto md:mx-0 mb-8 md:mb-0">
            <div className="hero-arch w-[250px] h-[330px] md:w-[320px] md:h-[420px] rounded-t-[125px] md:rounded-t-[160px] rounded-b-[8px] relative overflow-hidden border border-brand-gold/30">
              <div className="hero-image-settle absolute inset-0">
                <div className="hero-image-breathe absolute inset-0">
                  <Image
                    src={c('hero.image', '/images/hero-editorial.jpg')}
                    alt="Hero editorial"
                    fill
                    sizes="(max-width: 768px) 250px, 320px"
                    priority
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="absolute inset-[12px] rounded-t-[113px] md:rounded-t-[148px] rounded-b-none border border-brand-gold/30 pointer-events-none z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#2C0A14]/60 to-transparent"></div>
              <div className="hero-curtain absolute inset-0 z-30 bg-gradient-to-br from-[#2C0A14] via-[#6E1A2C] to-[#8B2A3C] border-r-2 border-brand-gold/70 pointer-events-none"></div>
            </div>
            <div className="hero-card absolute -bottom-6 -left-2 md:-left-8 bg-white rounded-md p-4 shadow-lg min-w-[160px] z-20">
              <div className="text-[9px] text-brand-gold tracking-[0.12em] uppercase mb-1">{c('hero.card_badge', 'New In')}</div>
              <div className="font-display text-[17px] font-semibold text-brand-dark leading-[1.2]">{c('hero.card_title', "Eid Collection '26")}</div>
              <div className="text-[11px] text-[#5C3D2E] mt-1">{c('hero.card_subtitle', '48 new styles added')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Strip */}
      <section className="bg-brand-bg border-b border-brand-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
          {uspItems.map((item, i) => {
            const Icon = USP_ICONS[item.icon] || Sparkles
            return <UspItem key={i} icon={<Icon size={18} strokeWidth={1.5} />} title={item.title} detail={item.detail} />
          })}
        </div>
      </section>

      {/* SECTION 2 — Categories */}
      <section className="bg-brand-bg py-12 md:py-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="font-display text-[26px] md:text-[32px] font-semibold text-brand-dark">{c('home.categories_heading', 'Shop by Category')}</h2>
          </div>
          <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} name={cat.name} image={cat.image_url} gradient={CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]} />
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="flex justify-center py-2 bg-brand-bg">
        <svg width="280" height="20" viewBox="0 0 280 20"><line x1="0" y1="10" x2="118" y2="10" stroke="#C49B38" strokeWidth="0.75"></line><rect x="126" y="5" width="10" height="10" fill="#C49B38" transform="rotate(45 131 10)"></rect><circle cx="122" cy="10" r="2" fill="#C49B38"></circle><circle cx="140" cy="10" r="2" fill="#C49B38"></circle><rect x="133" y="7" width="6" height="6" fill="none" stroke="#C49B38" strokeWidth="0.75" transform="rotate(45 136 10)"></rect><line x1="142" y1="10" x2="260" y2="10" stroke="#C49B38" strokeWidth="0.75"></line><circle cx="4" cy="10" r="2" fill="#C49B38"></circle><circle cx="256" cy="10" r="2" fill="#C49B38"></circle></svg>
      </div>

      {/* SECTION 3 — Featured Collection */}
      <section className="bg-brand-bg py-12 md:py-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="font-display text-[28px] md:text-[36px] font-semibold text-brand-dark">{c('home.featured_heading', 'Featured Collection')}</h2>
            <a href="/shop" className="text-[13px] text-brand-gold font-medium hover:text-[#8B6914] transition-colors">{c('home.featured_link_label', 'View All')} &rarr;</a>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-brand-gold to-transparent mb-7"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts && featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Brand Story */}
      <section className="bg-brand-bg py-12 md:py-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row bg-[#FAF7F0] rounded-none border border-brand-border">
            <div className="flex-1 p-8 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-brand-border relative">
              <svg className="absolute top-8 left-8 opacity-20" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C49B38" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <h2 className="font-display text-[32px] md:text-[40px] font-medium text-brand-dark leading-[1.1] mb-5">
                {storyHeadingLines.map((line, i) => (
                  <span key={i}>{line}{i < storyHeadingLines.length - 1 && <br/>}</span>
                ))}
              </h2>
              <p className="text-[14px] text-brand-muted leading-[1.8] max-w-[420px] mb-8 font-light">
                {c('story.body', 'Every piece at Soul Sisters tells a story of craftsmanship. We work directly with artisans across India to bring you authentic textiles, reimagined in contemporary silhouettes that fit the vibrant lifestyle of Dubai.')}
              </p>
              <div className="flex gap-10">
                {storyStats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-[20px] font-display text-brand-accent">{stat.value}</div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-brand-gold mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-[300px] md:min-h-[420px] relative overflow-hidden">
              <Image
                src={c('story.image', '/images/story-artisan.jpg')}
                alt="Brand story"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C0A14]/30 to-transparent"></div>
              <div className="absolute bottom-4 right-5 text-[9px] tracking-[0.18em] text-brand-bg/90 uppercase z-10">{c('story.caption', 'sourced from artisan markets')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function UspItem({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#F2EAD8] text-brand-accent flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-brand-dark leading-tight">{title}</div>
        <div className="text-[11px] text-brand-muted mt-[2px]">{detail}</div>
      </div>
    </div>
  )
}

function CategoryCard({ name, image, gradient }) {
  return (
    <a
      href={`/shop?category=${encodeURIComponent(name)}`}
      className="flex-shrink-0 w-[120px] md:w-[160px] snap-start flex flex-col items-center gap-2 cursor-pointer group"
    >
      <div className={`w-full aspect-[4/5] rounded-t-[100px] rounded-b-[4px] border border-brand-gold/25 relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 ${image ? 'bg-[#E0D0B8]/40' : `bg-gradient-to-br ${gradient}`}`}>
        {image && (
          <Image
            src={image}
            alt={`${name} category`}
            fill
            sizes="(max-width: 768px) 120px, 160px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C0A14]/25 via-transparent to-transparent"></div>
        <div className="absolute inset-[6px] rounded-t-[94px] rounded-b-none border border-white/25 pointer-events-none z-10"></div>
      </div>
      <span className="text-[13px] md:text-[14px] font-medium text-brand-dark mt-1 group-hover:text-brand-accent transition-colors">
        {name}
      </span>
    </a>
  )
}
