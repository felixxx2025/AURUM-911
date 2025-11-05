import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Skip middleware for localhost and main domain
  if (hostname.includes('localhost') || hostname === 'aurum.cool' || hostname === 'www.aurum.cool') {
    return NextResponse.next()
  }
  
  // Handle subdomain routing
  if (subdomain && subdomain !== 'www') {
    // Add subdomain to headers for the app to use
    const response = NextResponse.next()
    response.headers.set('x-subdomain', subdomain)
    
    // Rewrite to tenant-specific pages if needed
    if (url.pathname === '/') {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}