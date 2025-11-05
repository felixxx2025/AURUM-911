/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/:path*`,
      },
    ]
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

    // Build a pragmatic CSP that works with Next.js App Router and Tailwind
    // Adjusts for dev vs prod and includes API origin in connect-src
    const csp = [
      "default-src 'self'",
      // Next.js may inject inline styles (Tailwind + SSR) – keep 'unsafe-inline' for styles
      "style-src 'self' 'unsafe-inline'",
      // Allow Next.js scripts; avoid 'unsafe-eval' in prod, keep in dev for HMR
      `script-src 'self'${isProd ? '' : " 'unsafe-eval'"}`,
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
      // Send CSP violation reports to a local endpoint that is not proxied by rewrites
      'report-uri /csp-report',
    ]
      .filter(Boolean)
      .join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Strong CSP; keep aligned with Next.js capabilities
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          // Optional Reporting-Endpoints header to support the reporting API in modern browsers
          {
            key: 'Reporting-Endpoints',
            value: 'csp=/csp-report',
          },
          // Extra hardening (HSTS in prod)
          ...(isProd
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
                {
                  key: 'Permissions-Policy',
                  value: [
                    'accelerometer=()',
                    'ambient-light-sensor=()',
                    'autoplay=()',
                    'battery=()',
                    'camera=()',
                    'cross-origin-isolated=()',
                    'display-capture=()',
                    'document-domain=()',
                    'encrypted-media=()',
                    'execution-while-not-rendered=()',
                    'execution-while-out-of-viewport=()',
                    'fullscreen=(self)',
                    'gamepad=()',
                    'geolocation=()',
                    'gyroscope=()',
                    'keyboard-map=()',
                    'magnetometer=()',
                    'microphone=()',
                    'midi=()',
                    'navigation-override=()',
                    'payment=()',
                    'picture-in-picture=(self)',
                    'publickey-credentials-get=(self)',
                    'screen-wake-lock=()',
                    'sync-xhr=()',
                    'usb=()',
                    'web-share=()',
                    'xr-spatial-tracking=()',
                  ].join(', '),
                },
              ]
            : []),
        ],
      },
    ]
  },
}

module.exports = nextConfig
