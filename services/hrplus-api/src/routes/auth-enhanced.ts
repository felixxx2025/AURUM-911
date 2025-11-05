import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { prisma } from '../plugins/prisma'
import { generateTokens, verifyRefreshToken } from '../lib/auth'
import { securityMiddleware } from '../middleware/security'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  mfaCode: z.string().optional(),
})

const mfaSetupSchema = z.object({
  password: z.string().min(6),
})

const mfaVerifySchema = z.object({
  token: z.string().length(6),
  secret: z.string(),
})

export async function authEnhancedRoutes(fastify: FastifyInstance) {
  // Enhanced login with MFA support
  fastify.post('/auth/login', {
    preHandler: [securityMiddleware.loginRateLimit],
    schema: { body: loginSchema },
  }, async (request, reply) => {
    const { email, password, mfaCode } = request.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    // Check if MFA is enabled
    if (user.mfaSecret && !mfaCode) {
      return reply.send({
        mfaRequired: true,
        user: { id: user.id, email: user.email, name: user.name }
      })
    }

    // Verify MFA if provided
    if (user.mfaSecret && mfaCode) {
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 2
      })

      if (!verified) {
        return reply.code(401).send({ error: 'Invalid MFA code' })
      }
    }

    const tokens = await generateTokens(user.id, user.tenantId)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: !!user.mfaSecret,
        lastLogin: user.lastLogin,
      },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: 3600,
      tenant_id: user.tenantId,
    }
  })

  // Refresh token endpoint
  fastify.post('/auth/refresh', {
    schema: {
      body: z.object({
        refresh_token: z.string(),
      })
    }
  }, async (request, reply) => {
    const { refresh_token } = request.body

    try {
      const payload = await verifyRefreshToken(refresh_token)
      const tokens = await generateTokens(payload.userId, payload.tenantId)

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: 3600,
      }
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid refresh token' })
    }
  })

  // MFA setup
  fastify.post('/auth/mfa/setup', {
    preHandler: [fastify.authenticate],
    schema: { body: mfaSetupSchema },
  }, async (request, reply) => {
    const { password } = request.body
    const userId = request.user.id

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !await bcrypt.compare(password, user.password)) {
      return reply.code(401).send({ error: 'Invalid password' })
    }

    const secret = speakeasy.generateSecret({
      name: `AURUM-911 (${user.email})`,
      issuer: 'AURUM-911',
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    }
  })

  // MFA verification
  fastify.post('/auth/mfa/verify', {
    preHandler: [fastify.authenticate],
    schema: { body: mfaVerifySchema },
  }, async (request, reply) => {
    const { token, secret } = request.body
    const userId = request.user.id

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!verified) {
      return reply.code(400).send({ error: 'Invalid MFA token' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret }
    })

    return { success: true, message: 'MFA enabled successfully' }
  })

  // Disable MFA
  fastify.post('/auth/mfa/disable', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        password: z.string().min(6),
      })
    }
  }, async (request, reply) => {
    const { password } = request.body
    const userId = request.user.id

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !await bcrypt.compare(password, user.password)) {
      return reply.code(401).send({ error: 'Invalid password' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: null }
    })

    return { success: true, message: 'MFA disabled successfully' }
  })

  // Logout (invalidate refresh token)
  fastify.post('/auth/logout', {
    schema: {
      body: z.object({
        refresh_token: z.string(),
      })
    }
  }, async (request, reply) => {
    const { refresh_token } = request.body

    // Add refresh token to blacklist
    await prisma.tokenBlacklist.create({
      data: {
        token: refresh_token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })

    return { success: true, message: 'Logged out successfully' }
  })
}