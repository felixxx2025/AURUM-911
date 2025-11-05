import { headers } from 'next/headers'

/**
 * Get the CSP nonce from request headers (server-side only)
 * This nonce is generated in middleware and passed via x-nonce header
 * 
 * @returns The nonce string or undefined if not available
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('x-nonce') || undefined
}

/**
 * Get the CSP nonce from request headers synchronously (legacy)
 * Note: In Next.js 15+, headers() returns a Promise
 * 
 * @returns The nonce string or undefined if not available
 */
export function getNonceSync(): string | undefined {
  // This is a fallback for components that can't use async
  // In production, prefer using getNonce() with async/await
  return undefined
}
