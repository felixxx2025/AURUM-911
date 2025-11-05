interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  logo?: string
  favicon?: string
  customCSS?: string
}

export class ThemeEngine {
  private currentTheme: ThemeConfig | null = null

  async loadTenantTheme(tenantId: string): Promise<ThemeConfig> {
    try {
      const response = await fetch(`/api/v1/tenants/${tenantId}/theme`)
      const theme = await response.json()
      this.currentTheme = theme
      this.applyTheme(theme)
      return theme
    } catch (error) {
      console.warn('Failed to load tenant theme, using default')
      return this.getDefaultTheme()
    }
  }

  private applyTheme(theme: ThemeConfig) {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)

    if (theme.favicon) {
      this.updateFavicon(theme.favicon)
    }

    if (theme.customCSS) {
      this.injectCustomCSS(theme.customCSS)
    }
  }

  private updateFavicon(faviconUrl: string) {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (link) {
      link.href = faviconUrl
    }
  }

  private injectCustomCSS(css: string) {
    const existingStyle = document.getElementById('tenant-custom-css')
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = 'tenant-custom-css'
    style.textContent = css
    document.head.appendChild(style)
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    }
  }

  generateCSS(theme: ThemeConfig): string {
    return `
      :root {
        --color-primary: ${theme.primary};
        --color-secondary: ${theme.secondary};
        --color-accent: ${theme.accent};
        --color-background: ${theme.background};
        --color-surface: ${theme.surface};
        --color-text: ${theme.text};
      }
      
      .btn-primary {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
      
      .bg-primary {
        background-color: var(--color-primary);
      }
      
      .text-primary {
        color: var(--color-primary);
      }
    `
  }

  previewTheme(theme: ThemeConfig) {
    this.applyTheme(theme)
  }

  resetTheme() {
    if (this.currentTheme) {
      this.applyTheme(this.currentTheme)
    } else {
      this.applyTheme(this.getDefaultTheme())
    }
  }
}

export const themeEngine = new ThemeEngine()