import { beforeEach, describe, expect, it } from '@jest/globals'
import { FastifyInstance } from 'fastify'

import { createApp } from '../app'

describe('Authentication', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await createApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@aurum.cool',
          password: 'test123'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('access_token')
      expect(body).toHaveProperty('user')
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'invalid@test.com',
          password: 'wrong1'
        }
      })

      expect(response.statusCode).toBe(401)
    })

    it('should validate input format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'invalid-email',
          password: '123'
        }
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login attempts', async () => {
      const requests = Array(6).fill(null).map(() => 
        app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: { email: 'test@test.com', password: 'wrong1' }
        })
      )

      const responses = await Promise.all(requests)
      const lastResponse = responses[responses.length - 1]
      
      expect(lastResponse.statusCode).toBe(429)
    })
  })
})