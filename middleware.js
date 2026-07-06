import { NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/adminSession'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // Skip middleware for login route itself
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const token = request.cookies.get('admin_session')?.value
    const session = await verifySessionToken(token)

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
