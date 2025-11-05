/**
 * Utility to access CSP nonce for inline scripts and styles
 * 
 * Usage in Server Components:
 * ```tsx
 * import { getNonce } from '@/lib/nonce'
 * 
 * export default function MyComponent() {
 *   const nonce = getNonce()
 *   return <script nonce={nonce}>...</script>
 * }
 * ```
 */

import { headers } from 'next/headers'

/**
 * Get the CSP nonce from request headers
 * This nonce is generated in middleware.ts for each request
 */
export function getNonce(): string | null {
  try {
    const headersList = headers()
    return headersList.get('x-nonce')
  } catch {
    // headers() can only be called in Server Components
    return null
  }
}
