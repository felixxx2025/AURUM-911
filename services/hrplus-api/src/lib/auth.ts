import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret'

export interface JWTPayload {
  userId: string
  tenantId: string
  email: string
  role: string
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  generateTokens(payload: JWTPayload) {
  const accessToken = (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, { expiresIn: '30d' })
    
    return { accessToken, refreshToken }
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  }

  async login(email: string, password: string, subdomain?: string) {
    let user
    
    if (subdomain) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { subdomain },
        include: { users: { where: { email, is_active: true } } }
      })
      
      if (!tenant || tenant.users.length === 0) {
        throw new Error('Invalid credentials')
      }
      
      user = { ...tenant.users[0], tenant }
    } else {
      user = await this.prisma.user.findUnique({
        where: { email, is_active: true },
        include: { tenant: true }
      })
    }

    if (!user || !await this.comparePassword(password, user.password)) {
      throw new Error('Invalid credentials')
    }

    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role
    }

    const tokens = this.generateTokens(payload)
    
    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: tokens.refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tenant: user.tenant,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      tenant_id: user.tenant_id
    }
  }
}