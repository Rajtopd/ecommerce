import { DM_Serif_Display, Josefin_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartProvider from '@/components/cart/CartProvider'
import CartDrawer from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/components/ui/ToastContext'
import { AuthProvider } from '@/lib/authContext'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  title: 'Soul Sisters',
  description: "Contemporary women's fashion — Dubai",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${josefinSans.variable}`}>
      <body className="antialiased">
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
      </body>
    </html>
  )
}
