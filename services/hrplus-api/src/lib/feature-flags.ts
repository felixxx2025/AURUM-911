interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage?: number
  conditions?: Record<string, any>
}

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()

  constructor() {
    this.initializeFlags()
  }

  private initializeFlags() {
    const defaultFlags: FeatureFlag[] = [
      { name: 'ai_insights', enabled: true, rolloutPercentage: 100 },
      { name: 'revenue_sharing', enabled: true, rolloutPercentage: 100 },
      { name: 'advanced_analytics', enabled: true, rolloutPercentage: 80 },
      { name: 'mfa_enforcement', enabled: false, rolloutPercentage: 0 },
      { name: 'new_dashboard', enabled: false, rolloutPercentage: 10 },
    ]

    defaultFlags.forEach(flag => {
      this.flags.set(flag.name, flag)
    })
  }

  isEnabled(flagName: string, context?: { userId?: string; tenantId?: string }): boolean {
    const flag = this.flags.get(flagName)
    if (!flag) return false

    if (!flag.enabled) return false

    if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
      const hash = this.hashContext(flagName, context)
      return hash < flag.rolloutPercentage
    }

    return true
  }

  setFlag(name: string, enabled: boolean, rolloutPercentage?: number) {
    const flag = this.flags.get(name) || { name, enabled: false }
    flag.enabled = enabled
    if (rolloutPercentage !== undefined) {
      flag.rolloutPercentage = rolloutPercentage
    }
    this.flags.set(name, flag)
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  private hashContext(flagName: string, context?: { userId?: string; tenantId?: string }): number {
    const key = `${flagName}:${context?.userId || 'anonymous'}:${context?.tenantId || 'default'}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100
  }
}

export const featureFlags = new FeatureFlagManager()