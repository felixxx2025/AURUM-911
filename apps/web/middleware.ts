import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Generates a cryptographically secure random nonce for CSP
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Generate a nonce for CSP
  const nonce = generateNonce()
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Create the response
  let response: NextResponse
  
  // Skip middleware for localhost and main domain
  if (hostname.includes('localhost') || hostname === 'aurum.cool' || hostname === 'www.aurum.cool') {
    response = NextResponse.next()
  }
  // Handle subdomain routing
  else if (subdomain && subdomain !== 'www') {
    // Rewrite to tenant-specific pages if needed
    if (url.pathname === '/') {
      url.pathname = '/auth/login'
      response = NextResponse.redirect(url)
    } else {
      response = NextResponse.next()
    }
    response.headers.set('x-subdomain', subdomain)
  } else {
    response = NextResponse.next()
  }
  
  // Set nonce in request headers so it can be accessed in the layout
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  
  // Create CSP with nonce
  const isProd = process.env.NODE_ENV === 'production'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  
  const csp = [
    "default-src 'self'",
    // Use nonce for styles instead of 'unsafe-inline'
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    // Use nonce for scripts, keep 'unsafe-eval' in dev for HMR
    `script-src 'self' 'nonce-${nonce}'${isProd ? '' : " 'unsafe-eval'"}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiUrl || ''} ${isProd ? '' : 'ws: wss: http: https:'}`.trim(),
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    'report-uri /csp-report',
  ]
    .filter(Boolean)
    .join('; ')
  
  // Set CSP header with nonce
  response.headers.set('Content-Security-Policy', csp)
  
  // Set nonce in a custom header so the layout can access it
  response.headers.set('x-nonce', nonce)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
    headers: response.headers,
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}