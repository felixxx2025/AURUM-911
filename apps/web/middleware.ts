import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Generates a cryptographically secure random nonce for CSP
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  // Convert to base64 using browser-compatible btoa
  return btoa(String.fromCharCode(...array))
}

/**
 * Determines if subdomain header should be set based on hostname
 */
function shouldSetSubdomainHeader(subdomain: string, hostname: string): boolean {
  return (
    subdomain !== '' &&
    subdomain !== 'www' &&
    !hostname.includes('localhost') &&
    hostname !== 'aurum.cool' &&
    hostname !== 'www.aurum.cool'
  )
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Generate a nonce for CSP
  const nonce = generateNonce()
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Determine the response type
  let isRedirect = false
  
  // Handle subdomain routing
  if (subdomain && subdomain !== 'www' && !hostname.includes('localhost') && hostname !== 'aurum.cool' && hostname !== 'www.aurum.cool') {
    // Rewrite to tenant-specific pages if needed
    if (url.pathname === '/') {
      url.pathname = '/auth/login'
      isRedirect = true
    }
  }
  
  // Set nonce in request headers so it can be accessed in the layout
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  
  // Create CSP with nonce
  const isProd = process.env.NODE_ENV === 'production'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  
  const csp = [
    "default-src 'self'",
    // Use nonce for styles - browsers that support nonces will use them, older browsers will be blocked
    `style-src 'self' 'nonce-${nonce}'`,
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
  
  // Create response with appropriate type
  const response = isRedirect 
    ? NextResponse.redirect(url)
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
  
  // Set CSP header with nonce
  response.headers.set('Content-Security-Policy', csp)
  
  // Set nonce in response header so the layout can access it
  response.headers.set('x-nonce', nonce)
  
  // Set subdomain header if applicable
  if (shouldSetSubdomainHeader(subdomain, hostname)) {
    response.headers.set('x-subdomain', subdomain)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}