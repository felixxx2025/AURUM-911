import { createPrivateKey, createPublicKey } from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { JwtHeader } from 'jsonwebtoken';

type Client = { id: string; secret: string; scopes: string[] }

function loadClients(): Client[] {
  try {
    const raw = process.env.OAUTH_CLIENTS || '[]'
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // ignore
  }
  const fallback = process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET
    ? [{ id: process.env.OAUTH_CLIENT_ID!, secret: process.env.OAUTH_CLIENT_SECRET!, scopes: ['*'] }]
    : []
  return fallback as Client[]
}

function loadKeys() {
  const alg = (process.env.OAUTH_ALG || 'RS256').toUpperCase()
  const kid = process.env.OAUTH_KEY_ID || 'aurum-key-1'
  const priv = (process.env.OAUTH_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const pub = (process.env.OAUTH_PUBLIC_KEY || '').replace(/\\n/g, '\n')
  if (!priv || !pub) throw new Error('Missing OAUTH_PRIVATE_KEY/OAUTH_PUBLIC_KEY')
  const privateKey = createPrivateKey(priv)
  const publicKey = createPublicKey(pub)
  return { alg, kid, privateKey, publicKey, publicPEM: pub }
}

export async function oauthRoutes(app: FastifyInstance) {
  const clients = loadClients()
  const keys = loadKeys()

  // JWKS endpoint
  app.get('/.well-known/jwks.json', async () => {
    // Convert PEM public key to JWK (minimal; using x5c-less RSA fields via node's export)
  const jwk = keys.publicKey.export({ format: 'jwk' }) as unknown as { kty: string; n: string; e: string }
  return { keys: [{ kid: keys.kid, kty: jwk.kty, n: jwk.n, e: jwk.e, alg: keys.alg, use: 'sig' }] }
  })

  // OAuth2 Token (Client Credentials)
  app.post('/oauth2/token', {
    schema: {
      tags: ['oauth2'],
      body: {
        type: 'object',
        properties: {
          grant_type: { type: 'string', enum: ['client_credentials'] },
          client_id: { type: 'string' },
          client_secret: { type: 'string' },
          scope: { type: 'string' }
        },
        required: ['grant_type', 'client_id', 'client_secret']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            token_type: { type: 'string' },
            expires_in: { type: 'number' },
            scope: { type: 'string' }
          },
          required: ['access_token','token_type','expires_in']
        }
      }
    }
  }, async (req: FastifyRequest<{ Body: { grant_type: string; client_id: string; client_secret: string; scope?: string } }>, reply: FastifyReply) => {
    const { grant_type, client_id, client_secret, scope } = req.body
    if (grant_type !== 'client_credentials') return reply.code(400).send({ error: 'unsupported_grant_type' })
    const client = clients.find(c => c.id === client_id && c.secret === client_secret)
    if (!client) return reply.code(401).send({ error: 'invalid_client' })

    const requestedScopes = (scope || '').split(' ').filter(Boolean)
    const allowed = client.scopes.includes('*') ? requestedScopes : requestedScopes.filter(s => client.scopes.includes(s))
    const finalScopes = allowed.length ? allowed : client.scopes

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600
    const payload = {
      iss: process.env.OAUTH_ISSUER || 'https://auth.aurum.local',
      sub: client_id,
      aud: process.env.OAUTH_AUDIENCE || 'aurum-api',
      iat: now,
      exp,
      scope: finalScopes.join(' ')
    }
    const header: JwtHeader = { alg: 'RS256', kid: keys.kid, typ: 'JWT' }
    const token = app.jwt.sign(payload, { algorithm: 'RS256', header })
    return reply.send({ access_token: token, token_type: 'Bearer', expires_in: 3600, scope: payload.scope })
  })
}
