'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useSiteData, useContent } from '@/components/SiteDataContext';

const DEFAULT_HELP_LINKS = [
  { label: 'Track Your Order', href: '/track' },
  { label: 'My Account', href: '/account' },
  { label: 'Returns & Exchanges', href: '#' },
  { label: 'Size Guide', href: '#' },
  { label: 'Contact Us', href: '#' },
];
const DEFAULT_DELIVERY_LINES = ['Dubai, UAE only', 'Free over د.إ 200', '1–3 business days', '7-day easy returns'];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { categories, content } = useSiteData();
  const c = useContent();

  if (pathname.startsWith('/admin')) return null;

  const categoryNames = categories.length ? categories.map(cat => cat.name) : PRODUCT_CATEGORIES;
  const helpLinks = Array.isArray(content['footer.help_links']) ? content['footer.help_links'] : DEFAULT_HELP_LINKS;
  const deliveryLines = Array.isArray(content['footer.delivery_lines']) ? content['footer.delivery_lines'] : DEFAULT_DELIVERY_LINES;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer className="bg-[#1A0F0A]">
      {/* Newsletter band */}
      <div className="border-b border-[#2A1F1A]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-brand-gold mb-2">{c('footer.newsletter_eyebrow', 'Join the Sisterhood')}</div>
            <h3 className="font-display text-[26px] md:text-[32px] text-brand-bg font-medium leading-[1.15]">
              {c('footer.newsletter_heading', 'First to know. New drops, private sales.').replace(/\.$/, '')}<span className="text-brand-gold">.</span>
            </h3>
          </div>
          {subscribed ? (
            <div className="text-[14px] text-brand-gold animate-fade-in">
              ✦ &nbsp;Welcome to the sisterhood — you&apos;re on the list.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 md:w-[300px] bg-transparent border border-[#3D2B20] border-r-0 text-brand-bg placeholder:text-[#6B5344] px-4 py-[13px] text-[13px] focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-brand-gold text-[#1A0F0A] px-6 py-[13px] text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#E8C96A] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <span className="font-display text-[24px] text-brand-bg font-bold tracking-[0.06em]">{c('brand.name', 'Soul Sisters')}</span>
          <div className="text-[10px] uppercase tracking-[0.1em] text-brand-gold mt-1 mb-4">
            {c('brand.tagline', 'Ethnic Couture · Dubai')}
          </div>
          <p className="text-[12px] text-[#8A7364] leading-[1.7] max-w-[260px]">
            {c('footer.blurb', 'Curated Indian ethnic wear for the modern woman in Dubai — crafted by artisans, delivered to your door.')}
          </p>
          <div className="flex gap-4 mt-5">
            <a href={c('footer.instagram_url', '#')} aria-label="Instagram" className="text-[#8A7364] hover:text-brand-gold transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href={c('footer.whatsapp_url', '#')} aria-label="WhatsApp" className="text-[#8A7364] hover:text-brand-gold transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-brand-gold mb-4">Shop</div>
          <div className="flex flex-col gap-2.5">
            <FooterLink href="/shop" label="All Pieces" />
            {categoryNames.slice(0, 5).map((name) => (
              <FooterLink key={name} href={`/shop?category=${encodeURIComponent(name)}`} label={name} />
            ))}
          </div>
        </div>

        {/* Help */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-brand-gold mb-4">Help</div>
          <div className="flex flex-col gap-2.5">
            {helpLinks.map((link, i) => (
              <FooterLink key={i} href={link.href || '#'} label={link.label || ''} />
            ))}
          </div>
        </div>

        {/* Delivery info */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-brand-gold mb-4">Delivery</div>
          <div className="flex flex-col gap-2.5 text-[13px] text-[#B5A090]">
            {deliveryLines.map((line, i) => <span key={i}>{line}</span>)}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2A1F1A]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[11px] text-[#6B5344]">
            {c('footer.copyright', '© 2026 Soul Sisters. All rights reserved.')}
          </span>
          <div className="flex items-center gap-2">
            <PaymentBadge label="VISA" />
            <PaymentBadge label="Mastercard" />
            <PaymentBadge label="AMEX" />
            <PaymentBadge label="Apple Pay" />
            <span className="text-[10px] text-[#6B5344] ml-2 hidden md:inline">Secure payments by Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, label }) {
  return (
    <a href={href} className="text-[13px] text-[#B5A090] hover:text-brand-bg transition-colors w-fit">
      {label}
    </a>
  )
}

function PaymentBadge({ label }) {
  return (
    <span className="border border-[#3D2B20] text-[#B5A090] text-[9px] font-semibold tracking-[0.05em] px-2.5 py-[5px] rounded-[3px] uppercase">
      {label}
    </span>
  )
}
