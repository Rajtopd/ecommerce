export default function ShopLoading() {
  return (
    <div className="bg-brand-bg min-h-screen pt-8 md:pt-12 pb-20 animate-pulse">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-6 md:mb-10">
        <div className="h-10 w-48 bg-brand-border/50 rounded-sm mb-4"></div>
        <div className="h-4 w-64 bg-brand-border/40 rounded-sm border-b border-brand-border pb-4"></div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8">
        <div className="hidden md:block w-[240px] flex-shrink-0 space-y-4">
          <div className="h-5 w-20 bg-brand-border/50 rounded-sm"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-32 bg-brand-border/40 rounded-sm"></div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-brand-border/40 rounded-[4px] mb-3"></div>
              <div className="h-3 w-16 bg-brand-border/40 rounded-sm mb-2"></div>
              <div className="h-5 w-3/4 bg-brand-border/50 rounded-sm mb-2"></div>
              <div className="h-4 w-20 bg-brand-border/40 rounded-sm"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
