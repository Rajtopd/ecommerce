'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Heart, User, ShoppingBag, Menu, X } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { useAuth } from '@/lib/authContext'

export default function Navbar() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  
  const [isScrolled, setIsScrolled] = useState(!isHomepage)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const { isLoggedIn } = useAuth()
  
  const openDrawer = useCartStore((state) => state.openDrawer)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const itemCount = getItemCount()

  // Hydration safety for cart count badge
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isHomepage) {
      setIsScrolled(true)
      return
    }

    // IntersectionObserver for homepage hero sentinel
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting)
      },
      { root: null, threshold: 0 }
    )

    const sentinel = document.getElementById('hero-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [isHomepage, pathname])

  // Style logic based on scroll and page
  const isTransparent = isHomepage && !isScrolled
  const navBg = isTransparent ? 'bg-transparent text-white' : 'bg-[#FAFAF8]/95 backdrop-blur-sm text-[#1C1410] border-b-[0.5px] border-[#E8E4DF]'
  const linkColor = isTransparent ? 'text-white' : 'text-[#6B5E54]'
  const iconColor = isTransparent ? 'text-white' : 'text-[#1C1410]'

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${navBg}`}>
        <div className="px-5 md:px-10 h-16 flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <div className="w-1/3">
            <a href="/" className={`font-display text-[18px] tracking-[0.08em] ${isTransparent ? 'text-white' : 'text-[#1C1410]'}`}>
              Soul Sisters
            </a>
          </div>

          {/* CENTER: Links (Desktop) */}
          <div className="hidden md:flex w-1/3 justify-center gap-8">
            <a href="/shop" className={`text-[10px] uppercase tracking-[0.12em] ${linkColor} hover:opacity-70 transition-opacity`}>Shop</a>
            <a href="/shop" className={`text-[10px] uppercase tracking-[0.12em] ${linkColor} hover:opacity-70 transition-opacity`}>Collections</a>
            <a href="#" className={`text-[10px] uppercase tracking-[0.12em] ${linkColor} hover:opacity-70 transition-opacity`}>About</a>
            <a href="#" className={`text-[10px] uppercase tracking-[0.12em] ${linkColor} hover:opacity-70 transition-opacity`}>Contact</a>
          </div>

          {/* RIGHT: Icons */}
          <div className="w-1/3 flex justify-end items-center gap-5">
            {/* Desktop Icons */}
            <a href="/account" className={`hidden md:block ${iconColor} hover:opacity-70 transition-opacity`}>
              <Heart size={20} strokeWidth={1.5} />
            </a>
            <a href={isLoggedIn ? "/account" : "/login"} className={`hidden md:block relative ${iconColor} hover:opacity-70 transition-opacity`}>
              <User size={20} strokeWidth={1.5} />
              {isLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C8726A] border-[1.5px] border-[#FAFAF8] rounded-full"></span>
              )}
            </a>
            
            {/* Bag Icon (Desktop + Mobile) */}
            <button onClick={openDrawer} className={`relative ${iconColor} hover:opacity-70 transition-opacity`}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C8726A] text-white text-[9px] w-[15px] h-[15px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className={`md:hidden ${iconColor} hover:opacity-70 transition-opacity`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`fixed inset-0 z-[60] bg-[#1C1410] transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="p-5 flex justify-end">
          <button onClick={() => setMobileMenuOpen(false)} className="text-[#6B5E54] hover:text-[#FAF7F4] transition-colors">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-10">
          <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="font-display text-[28px] text-[#FAF7F4]">Shop</a>
          <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="font-display text-[28px] text-[#FAF7F4]">Collections</a>
          <a href="#" onClick={() => setMobileMenuOpen(false)} className="font-display text-[28px] text-[#FAF7F4]">About</a>
          <a href="#" onClick={() => setMobileMenuOpen(false)} className="font-display text-[28px] text-[#FAF7F4]">Contact</a>
          <div className="flex gap-8 mt-4">
            <a href="/account" onClick={() => setMobileMenuOpen(false)} className="text-[#FAF7F4] opacity-80"><Heart size={24} strokeWidth={1.5} /></a>
            <a href={isLoggedIn ? "/account" : "/login"} onClick={() => setMobileMenuOpen(false)} className="text-[#FAF7F4] opacity-80 relative">
              <User size={24} strokeWidth={1.5} />
              {isLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C8726A] border-[1.5px] border-[#1C1410] rounded-full"></span>
              )}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
