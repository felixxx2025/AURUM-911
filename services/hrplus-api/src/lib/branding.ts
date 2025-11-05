// Sistema White-label - Baseado em Shopify e WordPress.com
import { PrismaClient } from '@prisma/client'

import { cacheService } from './cache'


interface BrandingConfig {
  tenantId: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor?: string
  fontFamily?: string
  customCss?: string
  customDomain?: string
  companyName: string
  tagline?: string
  footerText?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: string
    headingFont?: string
  }
  layout: {
    sidebarWidth: number
    headerHeight: number
    borderRadius: number
  }
}

const defaultThemes: Record<string, ThemeConfig> = {
  corporate: {
    name: 'Corporate Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#0ea5e9',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b'
    },
    typography: {
      fontFamily: 'Inter, sans-serif'
    },
    layout: {
      sidebarWidth: 256,
      headerHeight: 64,
      borderRadius: 8
    }
  },
  modern: {
    name: 'Modern Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#a855f7',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#111827'
    },
    typography: {
      fontFamily: 'Poppins, sans-serif'
    },
    layout: {
      sidebarWidth: 280,
      headerHeight: 72,
      borderRadius: 12
    }
  },
  minimal: {
    name: 'Minimal Gray',
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif'
    },
    layout: {
      sidebarWidth: 240,
      headerHeight: 56,
      borderRadius: 4
    }
  }
}

export class BrandingService {
  constructor(private prisma: PrismaClient) {}

  async getBrandingConfig(tenantId: string): Promise<BrandingConfig | null> {
    const cacheKey = cacheService.tenantKey(tenantId, 'branding')
    
    // Try cache first
    let config = await cacheService.get<BrandingConfig>(cacheKey)
    
    if (!config) {
      // Load from database
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          logo_url: true,
          primary_color: true,
          subdomain: true
        }
      })

      if (!tenant) return null

      config = {
        tenantId,
        logoUrl: tenant.logo_url || undefined,
        primaryColor: tenant.primary_color,
        companyName: tenant.name,
        customDomain: `${tenant.subdomain}.aurum.cool`
      }

      // Cache for 1 hour
      await cacheService.set(cacheKey, config, 3600)
    }

    return config
  }

  async updateBrandingConfig(tenantId: string, updates: Partial<BrandingConfig>): Promise<BrandingConfig> {
    // Update database
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        logo_url: updates.logoUrl,
        primary_color: updates.primaryColor,
        name: updates.companyName
      }
    })

    // Invalidate cache
    const cacheKey = cacheService.tenantKey(tenantId, 'branding')
    await cacheService.del(cacheKey)

    // Return updated config
    return await this.getBrandingConfig(tenantId) as BrandingConfig
  }

  generateCSS(config: BrandingConfig, theme?: string): string {
    const selectedTheme = theme ? defaultThemes[theme] : defaultThemes.corporate
    
    return `
      :root {
        --primary-color: ${config.primaryColor || selectedTheme.colors.primary};
        --secondary-color: ${config.secondaryColor || selectedTheme.colors.secondary};
        --accent-color: ${selectedTheme.colors.accent};
        --background-color: ${selectedTheme.colors.background};
        --surface-color: ${selectedTheme.colors.surface};
        --text-color: ${selectedTheme.colors.text};
        --font-family: ${config.fontFamily || selectedTheme.typography.fontFamily};
        --sidebar-width: ${selectedTheme.layout.sidebarWidth}px;
        --header-height: ${selectedTheme.layout.headerHeight}px;
        --border-radius: ${selectedTheme.layout.borderRadius}px;
      }

      .brand-primary { color: var(--primary-color) !important; }
      .brand-bg-primary { background-color: var(--primary-color) !important; }
      .brand-border-primary { border-color: var(--primary-color) !important; }
      
      .brand-logo {
        max-height: 40px;
        width: auto;
      }

      .sidebar {
        width: var(--sidebar-width);
        background-color: var(--surface-color);
      }

      .header {
        height: var(--header-height);
        background-color: var(--surface-color);
      }

      .btn-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .btn-primary:hover {
        background-color: color-mix(in srgb, var(--primary-color) 90%, black);
        border-color: color-mix(in srgb, var(--primary-color) 90%, black);
      }

      ${config.customCss || ''}
    `
  }

  async getAvailableThemes(): Promise<ThemeConfig[]> {
    return Object.values(defaultThemes)
  }

  async uploadLogo(tenantId: string, file: Buffer, filename: string): Promise<string> {
    // In production, upload to S3/CloudFlare R2
    const logoPath = `/uploads/logos/${tenantId}/${filename}`
    
    // Mock upload - in real implementation, use AWS SDK or similar
    console.log(`Uploading logo for tenant ${tenantId}: ${filename}`)
    
    // Update tenant with new logo URL
    await this.updateBrandingConfig(tenantId, {
      logoUrl: logoPath
    })

    return logoPath
  }

  async setupCustomDomain(tenantId: string, domain: string): Promise<boolean> {
    // Validate domain
    if (!this.isValidDomain(domain)) {
      throw new Error('Invalid domain format')
    }

    // Check if domain is available
    const existing = await this.prisma.tenant.findFirst({
      where: { 
        OR: [
          { subdomain: domain },
          // In real implementation, check custom_domain field
        ]
      }
    })

    if (existing && existing.id !== tenantId) {
      throw new Error('Domain already in use')
    }

    // Update tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        // custom_domain: domain - add this field to schema
      }
    })

    // In production: configure DNS, SSL certificates, etc.
    console.log(`Setting up custom domain ${domain} for tenant ${tenantId}`)

    return true
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  async previewTheme(tenantId: string, themeId: string): Promise<{ css: string; config: ThemeConfig }> {
    const config = await this.getBrandingConfig(tenantId)
    if (!config) throw new Error('Tenant not found')

    const theme = defaultThemes[themeId]
    if (!theme) throw new Error('Theme not found')

    return {
      css: this.generateCSS(config, themeId),
      config: theme
    }
  }

  async exportBrandingConfig(tenantId: string): Promise<any> {
    const config = await this.getBrandingConfig(tenantId)
    if (!config) throw new Error('Tenant not found')

    return {
      version: '1.0',
      tenant: tenantId,
      branding: config,
      exportedAt: new Date().toISOString()
    }
  }

  async importBrandingConfig(tenantId: string, configData: any): Promise<BrandingConfig> {
    if (configData.version !== '1.0') {
      throw new Error('Unsupported config version')
    }

    const { branding } = configData
    return await this.updateBrandingConfig(tenantId, branding)
  }
}

export const brandingService = new BrandingService(new PrismaClient())