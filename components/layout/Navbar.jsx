'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, Menu, X, Search } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { useAuth } from '@/lib/authContext'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { useSiteData, useContent } from '@/components/SiteDataContext'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isLoggedIn } = useAuth()
  const { categories } = useSiteData()
  const c = useContent()
  const categoryNames = categories.length ? categories.map(cat => cat.name) : PRODUCT_CATEGORIES

  const openDrawer = useCartStore((state) => state.openDrawer)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const itemCount = getItemCount()

  // Hydration safety for cart count badge
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div className="bg-brand-accent text-[#E8C96A] text-center py-[8px] px-4 text-[11px] md:text-[13px] tracking-[0.04em] font-normal">
        <span className="hidden md:inline">✦ &nbsp; </span>
        {c('announcement.primary', 'Free delivery across Dubai on orders over د.إ 200')}
        {c('announcement.secondary') && (
          <span className="hidden md:inline"> &nbsp;·&nbsp; {c('announcement.secondary')} &nbsp; ✦</span>
        )}
      </div>
      <nav className={`bg-brand-bg border-b border-brand-border sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_20px_rgba(26,15,10,0.08)]' : ''}`}>
        <div className="max-w-[1280px] mx-auto flex items-center px-4 md:px-8 py-4 gap-6">

          {/* LEFT: Logo */}
          <a href="/" className="flex-shrink-0">
            <div className="font-display text-[24px] md:text-[28px] font-bold text-brand-accent tracking-[0.06em] leading-none whitespace-nowrap">{c('brand.name', 'Soul Sisters')}</div>
            <div className="text-[8px] tracking-[0.22em] text-brand-gold uppercase mt-[2px]">{c('brand.tagline', 'Ethnic Couture · Dubai')}</div>
          </a>

          {/* CENTER: Links (Desktop) */}
          <div className="hidden md:flex gap-[22px] flex-1 justify-center">
            <NavLink href="/shop" label="Shop All" active={pathname === '/shop'} />
            {categoryNames.map((name) => (
              <NavLink key={name} href={`/shop?category=${encodeURIComponent(name)}`} label={name} />
            ))}
          </div>

          {/* RIGHT: Icons */}
          <div className="flex gap-[18px] items-center ml-auto flex-shrink-0">
            {/* Desktop Icons */}
            <a href="/shop" aria-label="Search" className="hidden md:block text-brand-dark hover:text-brand-accent transition-colors">
              <Search size={17} strokeWidth={1.5} />
            </a>
            <a href={isLoggedIn ? "/account" : "/login"} aria-label="Account" className="hidden md:block relative text-brand-dark hover:text-brand-accent transition-colors">
              <User size={17} strokeWidth={1.5} />
              {isLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-accent border-[1.5px] border-brand-bg rounded-full"></span>
              )}
            </a>

            {/* Bag Icon (Desktop + Mobile) */}
            <button onClick={openDrawer} aria-label="Open bag" className="relative text-brand-dark hover:text-brand-accent transition-colors cursor-pointer">
              <ShoppingBag size={17} strokeWidth={1.5} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-accent text-white rounded-full min-w-[16px] h-4 px-[3px] text-[9px] flex items-center justify-center font-bold animate-scale-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-brand-dark hover:opacity-70 transition-opacity"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] bg-brand-bg transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="p-5 flex justify-between items-center">
          <span className="font-display text-[20px] font-bold text-brand-accent tracking-[0.06em]">{c('brand.name', 'Soul Sisters')}</span>
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-brand-dark hover:opacity-70 transition-opacity">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-5 overflow-y-auto">
          <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="font-display text-[26px] text-brand-dark">Shop All</a>
          {categoryNames.map((name) => (
            <a
              key={name}
              href={`/shop?category=${encodeURIComponent(name)}`}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-[26px] text-brand-dark"
            >
              {name}
            </a>
          ))}
          <div className="flex gap-8 mt-4">
            <a href="/track" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.12em] text-brand-muted">Track Order</a>
            <a href={isLoggedIn ? "/account" : "/login"} onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.12em] text-brand-muted">
              {isLoggedIn ? 'My Account' : 'Sign In'}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

function NavLink({ href, label, active }) {
  return (
    <a
      href={href}
      className={`relative text-[13px] whitespace-nowrap transition-colors group ${active ? 'text-brand-accent' : 'text-brand-dark hover:text-brand-accent'}`}
    >
      {label}
      <span className={`absolute left-0 -bottom-[3px] h-[1px] bg-brand-accent transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
    </a>
  )
}
