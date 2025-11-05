# Nonce-Based Content Security Policy (CSP) Implementation

## Overview

This application implements a nonce-based Content Security Policy (CSP) for enhanced security. A nonce (number used once) is a cryptographically secure random value that is generated for each HTTP request and used to validate inline scripts and styles.

## How It Works

### 1. Nonce Generation (middleware.ts)

The middleware generates a unique nonce for each request using cryptographically secure random values:

```typescript
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  // Convert to base64 using browser-compatible btoa
  return btoa(String.fromCharCode(...array))
}
```

### 2. CSP Headers

The middleware sets CSP headers with the nonce for both scripts and styles:

```
script-src 'self' 'nonce-{random-value}' 'unsafe-eval' (in dev only)
style-src 'self' 'nonce-{random-value}'
```

Key points:
- `'nonce-{value}'`: Only allows scripts/styles with matching nonce attribute
- `'unsafe-eval'`: Only enabled in development for Hot Module Replacement (HMR)
- `'unsafe-inline'` is NOT used, ensuring maximum security

**Note**: This strict CSP means that older browsers that don't support nonces will block inline scripts/styles. This is intentional for maximum security. If broader compatibility is required, `'unsafe-inline'` can be added as a fallback, though browsers that support nonces will ignore it.

### 3. Accessing the Nonce

For custom inline scripts or styles, use the `getNonce()` utility:

```typescript
import { getNonce } from '@/lib/nonce'

export default function MyComponent() {
  const nonce = getNonce()
  
  return (
    <>
      <script nonce={nonce}>
        // Your inline script
      </script>
      <style nonce={nonce}>
        /* Your inline styles */
      </style>
    </>
  )
}
```

## Security Benefits

1. **Prevents XSS attacks**: Only scripts/styles with the correct nonce can execute
2. **Dynamic validation**: New nonce for each request makes replay attacks impossible
3. **Strict policy**: No 'unsafe-inline' means maximum protection
4. **CSP violation reporting**: Violations are reported to `/csp-report` endpoint

## Browser Support

- Modern browsers (Chrome 59+, Firefox 52+, Safari 10+): Full nonce support with strict validation
- Older browsers: Will block inline scripts/styles without nonces (by design for security)

If you need broader compatibility, you can add `'unsafe-inline'` to the CSP directives, though browsers that support nonces will ignore it in favor of nonce validation.

## Testing

To verify the CSP is working:

1. Check browser DevTools Network tab for CSP headers
2. Check browser Console for any CSP violations
3. Review `/csp-report` logs for violation reports

## Additional Security Headers

The application also sets these security headers:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME-type sniffing
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
- `Strict-Transport-Security` (production only) - Enforces HTTPS
- `Permissions-Policy` (production only) - Controls browser features
