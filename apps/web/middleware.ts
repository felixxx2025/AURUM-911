import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Generate a cryptographically secure nonce for CSP using Web Crypto API
 * Compatible with Edge Runtime
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Generate a unique nonce for this request
  const nonce = generateNonce()
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Skip middleware for localhost and main domain
  if (hostname.includes('localhost') || hostname === 'aurum.cool' || hostname === 'www.aurum.cool') {
    const response = NextResponse.next()
    response.headers.set('x-nonce', nonce)
    return response
  }
  
  // Handle subdomain routing
  if (subdomain && subdomain !== 'www') {
    // Add subdomain and nonce to headers for the app to use
    const response = NextResponse.next()
    response.headers.set('x-subdomain', subdomain)
    response.headers.set('x-nonce', nonce)
    
    // Rewrite to tenant-specific pages if needed
    if (url.pathname === '/') {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    
    return response
  }
  
  const response = NextResponse.next()
  response.headers.set('x-nonce', nonce)
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}