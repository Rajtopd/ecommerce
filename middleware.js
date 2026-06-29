import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value
    const validToken = process.env.ADMIN_SECRET_TOKEN

    // Skip middleware for login route itself
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    if (!adminToken || adminToken !== validToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
