import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Generate a cryptographically secure nonce for CSP using Web Crypto API
 * Compatible with Edge Runtime
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  // Convert to base64 without using Node.js Buffer (Edge Runtime compatible)
  let binary = ''
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i])
  }
  return btoa(binary)
}

/**
 * Build Content Security Policy header with nonce
 */
function buildCSP(nonce: string, isProd: boolean, apiUrl: string): string {
  const csp = [
    "default-src 'self'",
    // Styles: Use nonce for inline styles + self for external stylesheets
    // Keep 'unsafe-inline' as fallback for browsers that don't support nonces
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    // Scripts: Use nonce for inline scripts + self for external scripts
    // In dev, allow 'unsafe-eval' for HMR; in prod, only nonce + self
    `script-src 'self' 'nonce-${nonce}'${isProd ? '' : " 'unsafe-eval'"}`,
    // Images and icons
    "img-src 'self' data: blob: https:",
    // Fonts
    "font-src 'self' data:",
    // API calls, HMR/websocket in dev, and same-origin
    `connect-src 'self' ${apiUrl || ''} ${isProd ? '' : 'ws: wss: http: https:'}`.trim(),
    // Disallow framing
    "frame-ancestors 'none'",
    // Hardening
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Web workers and next dev overlay
    "worker-src 'self' blob:",
    // Manifest
    "manifest-src 'self'",
    // Send CSP violation reports to a local endpoint
    'report-uri /csp-report',
  ]
    .filter(Boolean)
    .join('; ')
  
  return csp
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Generate a unique nonce for this request
  const nonce = generateNonce()
  
  // Get environment variables
  const isProd = process.env.NODE_ENV === 'production'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  
  // Build CSP with nonce
  const csp = buildCSP(nonce, isProd, apiUrl)
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Create response and add security headers
  let response: NextResponse
  
  // Handle subdomain routing
  if (!hostname.includes('localhost') && hostname !== 'aurum.cool' && hostname !== 'www.aurum.cool') {
    if (subdomain && subdomain !== 'www') {
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
  } else {
    response = NextResponse.next()
  }
  
  // Add nonce and CSP headers to response
  // Note: x-nonce header is used by server components to access the nonce value
  // It's exposed intentionally for this purpose
  response.headers.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}