import { headers } from 'next/headers'

/**
 * Get the CSP nonce from request headers (server-side only)
 * This nonce is generated in middleware and passed via x-nonce header
 * 
 * @returns The nonce string or undefined if not available
 * 
 * Note: This function makes routes dynamic (not statically rendered) because it accesses headers.
 * This is expected behavior for nonce-based CSP.
 * 
 * @example
 * ```tsx
 * // In a server component
 * const nonce = await getNonce()
 * 
 * return (
 *   <script nonce={nonce}>
 *     console.log('This script uses CSP nonce')
 *   </script>
 * )
 * ```
 */
export async function getNonce(): Promise<string | undefined> {
  try {
    const headersList = await headers()
    return headersList.get('x-nonce') || undefined
  } catch (error) {
    // During static generation, headers() will throw an error
    // This is expected and can be safely ignored
    return undefined
  }
}
