import { Strategy as SamlStrategy } from 'passport-saml'
import { Strategy as OidcStrategy } from 'passport-openidconnect'
import passport from 'passport'

interface SSOConfig {
  type: 'saml' | 'oidc'
  tenantId: string
  entityId: string
  ssoUrl: string
  certificate: string
  callbackUrl: string
}

export class SSOManager {
  private configs = new Map<string, SSOConfig>()

  async configureSAML(tenantId: string, config: SSOConfig) {
    this.configs.set(tenantId, config)

    passport.use(`saml-${tenantId}`, new SamlStrategy({
      entryPoint: config.ssoUrl,
      issuer: config.entityId,
      callbackUrl: config.callbackUrl,
      cert: config.certificate,
      identifierFormat: null,
      decryptionPvk: null,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256'
    }, async (profile, done) => {
      try {
        const user = await this.processSSOUser(tenantId, profile)
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }))
  }

  async configureOIDC(tenantId: string, config: any) {
    passport.use(`oidc-${tenantId}`, new OidcStrategy({
      issuer: config.issuer,
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackUrl,
      scope: 'openid profile email'
    }, async (issuer, profile, done) => {
      try {
        const user = await this.processSSOUser(tenantId, profile)
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }))
  }

  private async processSSOUser(tenantId: string, profile: any) {
    const email = profile.email || profile.nameID
    
    // Find or create user
    let user = await prisma.user.findFirst({
      where: { email, tenantId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.displayName || profile.name,
          tenantId,
          ssoProvider: 'saml',
          ssoId: profile.nameID
        }
      })
    }

    return user
  }

  async generateSAMLMetadata(tenantId: string) {
    const config = this.configs.get(tenantId)
    if (!config) throw new Error('SSO not configured for tenant')

    return `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${config.entityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="${config.callbackUrl}"
                                 index="1" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`
  }
}