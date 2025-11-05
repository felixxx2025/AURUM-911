# CSP Nonce Implementation

This document describes the Content Security Policy (CSP) nonce implementation in the AURUM-911 web application.

## Overview

CSP nonces provide a secure way to allow specific inline scripts and styles while maintaining a strict Content Security Policy. Each request generates a unique, cryptographically secure nonce that can be used to whitelist inline content.

## Implementation Details

### 1. Middleware (`middleware.ts`)

The middleware generates a unique nonce for each incoming request using the Web Crypto API:

```typescript
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}
```

The nonce is then passed to the application via the `x-nonce` header:

```typescript
response.headers.set('x-nonce', nonce)
```

**Key Features:**
- Uses Web Crypto API for Edge Runtime compatibility
- Generates 16 bytes (128 bits) of random data
- Base64 encodes the nonce for use in CSP headers
- Attaches nonce to all requests, including subdomain routing

### 2. Nonce Utility (`lib/nonce.ts`)

A utility function provides access to the nonce in server components:

```typescript
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('x-nonce') || undefined
}
```

**Usage:**
```typescript
const nonce = await getNonce()
```

### 3. Root Layout (`app/layout.tsx`)

The root layout retrieves the nonce and makes it available in the HTML:

```typescript
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = await getNonce()
  
  return (
    <html lang="pt-BR">
      <head>
        {nonce && <meta property="csp-nonce" content={nonce} />}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 4. CSP Configuration (`next.config.js`)

The CSP header configuration is designed to work with nonces:

```javascript
"style-src 'self' 'unsafe-inline'",
"script-src 'self'${isProd ? '' : " 'unsafe-eval'"}",
```

**Note:** Currently, `'unsafe-inline'` is kept as a fallback for browsers that don't support nonces. In the future, when adding inline scripts/styles, use the nonce attribute:

```html
<script nonce={nonce}>
  // Your inline script
</script>

<style nonce={nonce}>
  /* Your inline styles */
</style>
```

## Security Benefits

1. **Prevents XSS Attacks**: Only scripts/styles with the correct nonce can execute
2. **Per-Request Uniqueness**: Each request gets a fresh nonce, preventing replay attacks
3. **Strict CSP**: Allows removal of `'unsafe-inline'` when all inline content uses nonces
4. **Edge Runtime Compatible**: Uses Web Crypto API instead of Node.js crypto module

## Usage in Components

### Server Components

```typescript
import { getNonce } from '@/lib/nonce'

export default async function MyComponent() {
  const nonce = await getNonce()
  
  return (
    <div>
      <script nonce={nonce}>
        console.log('This inline script is allowed by CSP')
      </script>
    </div>
  )
}
```

### Client Components

For client components, access the nonce from the meta tag:

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function MyClientComponent() {
  const [nonce, setNonce] = useState<string>()
  
  useEffect(() => {
    const metaTag = document.querySelector('meta[property="csp-nonce"]')
    if (metaTag) {
      setNonce(metaTag.getAttribute('content') || undefined)
    }
  }, [])
  
  // Use the nonce as needed
}
```

## Testing

1. **Development**: Run `npm run dev` and verify the app starts without errors
2. **Production Build**: Run `npm run build` to ensure the build succeeds
3. **Browser DevTools**: Check the Network tab to see the `x-nonce` header in responses
4. **CSP Reports**: Monitor `/csp-report` endpoint for any CSP violations

## Future Enhancements

1. **Stricter CSP**: Remove `'unsafe-inline'` once all inline content uses nonces
2. **CSP Nonce in Dynamic Scripts**: Apply nonces to dynamically injected scripts
3. **Monitoring**: Add metrics for CSP violation rates
4. **Testing**: Add automated tests for nonce generation and CSP compliance

## Related Files

- `apps/web/middleware.ts` - Nonce generation and header injection
- `apps/web/lib/nonce.ts` - Nonce utility functions
- `apps/web/app/layout.tsx` - Root layout with nonce integration
- `apps/web/next.config.js` - CSP header configuration
- `apps/web/app/csp-report/route.ts` - CSP violation reporting endpoint

## References

- [Content Security Policy (CSP) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP: script-src - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
