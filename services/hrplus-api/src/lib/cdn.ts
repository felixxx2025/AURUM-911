interface CDNConfig {
  baseUrl: string
  regions: string[]
  cacheHeaders: Record<string, string>
}

export class CDNManager {
  private config: CDNConfig

  constructor(config: CDNConfig) {
    this.config = config
  }

  generateAssetUrl(path: string, region?: string): string {
    const baseUrl = region ? 
      `https://${region}.${this.config.baseUrl}` : 
      `https://${this.config.baseUrl}`
    
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }

  optimizeImage(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  } = {}): string {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)
    
    return `${url}?${params.toString()}`
  }

  getCacheHeaders(assetType: 'static' | 'dynamic' | 'api'): Record<string, string> {
    switch (assetType) {
      case 'static':
        return {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': this.generateETag(),
        }
      case 'dynamic':
        return {
          'Cache-Control': 'public, max-age=3600, must-revalidate',
          'ETag': this.generateETag(),
        }
      case 'api':
        return {
          'Cache-Control': 'private, max-age=300',
        }
      default:
        return {}
    }
  }

  async purgeCache(paths: string[]): Promise<void> {
    // Simulate CDN cache purge
    console.log('Purging CDN cache for paths:', paths)
    
    // In real implementation, would call CDN API
    // await fetch(`${this.config.baseUrl}/purge`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.CDN_API_KEY}` },
    //   body: JSON.stringify({ paths })
    // })
  }

  getClosestRegion(userLocation?: { lat: number; lng: number }): string {
    if (!userLocation) return this.config.regions[0]
    
    // Simple region selection based on location
    // In real implementation, would use more sophisticated geo-routing
    const { lat } = userLocation
    
    if (lat > 40) return 'us-east'
    if (lat > 0) return 'us-west'
    if (lat > -30) return 'sa-east'
    return 'ap-southeast'
  }

  private generateETag(): string {
    return `"${Date.now().toString(36)}"`
  }
}

// Global CDN instance
export const cdn = new CDNManager({
  baseUrl: 'cdn.aurum.cool',
  regions: ['us-east', 'us-west', 'eu-west', 'ap-southeast', 'sa-east'],
  cacheHeaders: {
    'X-CDN-Provider': 'AURUM-CDN',
  },
})