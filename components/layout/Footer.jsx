export default function Footer() {
  return (
    <footer className="bg-[#1C1410] border-t-[0.5px] border-[#2D1F18]">
      <div className="px-10 py-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-1">
          <span className="font-display text-[18px] text-[#FAF7F4]">Soul Sisters</span>
          <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B5E54]">
            Women&apos;s Fashion · Dubai
          </span>
        </div>

        {/* Column 2 */}
        <div className="flex flex-row items-center gap-5">
          <a href="/shop" className="text-[9px] uppercase tracking-[0.1em] text-[#B5A89E] hover:text-[#FAF7F4] transition-colors">Shop</a>
          <a href="#" className="text-[9px] uppercase tracking-[0.1em] text-[#B5A89E] hover:text-[#FAF7F4] transition-colors">Returns</a>
          <a href="#" className="text-[9px] uppercase tracking-[0.1em] text-[#B5A89E] hover:text-[#FAF7F4] transition-colors">Contact</a>
          <a href="#" className="text-[#B5A89E] hover:text-[#FAF7F4] transition-colors ml-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>

        {/* Column 3 */}
        <div>
          <span className="text-[9px] text-[#4A3D35]">
            © 2026 Soul Sisters. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  )
}
