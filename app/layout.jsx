import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartProvider from '@/components/cart/CartProvider'
import CartDrawer from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/components/ui/ToastContext'
import { AuthProvider } from '@/lib/authContext'
import { SiteDataProvider } from '@/components/SiteDataContext'
import { getSiteData } from '@/lib/content'

export const revalidate = 60

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  title: 'Soul Sisters',
  description: "Contemporary women's fashion — Dubai",
}

export default async function RootLayout({ children }) {
  const siteData = await getSiteData()

  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <SiteDataProvider value={siteData}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <CartDrawer />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </SiteDataProvider>
      </body>
    </html>
  )
}
