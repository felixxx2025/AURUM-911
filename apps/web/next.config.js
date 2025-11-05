/** @type {import('next').NextConfig} */
const nextConfig = {
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
          // Note: CSP with nonce is now set in middleware.ts for dynamic nonce generation
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
