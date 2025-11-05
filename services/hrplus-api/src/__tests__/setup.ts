// Jest setup for API tests
export { }
import { jest } from '@jest/globals'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
// Não conectar ao banco em testes: força modo in-memory removendo DATABASE_URL
delete process.env.DATABASE_URL

// Mock external services
jest.mock('../integrations/openai', () => ({
  OpenAIService: class {
    constructor() {}
    async analisarCurriculo() {
      return {
        score: 80,
        skills: ['typescript', 'nodejs'],
        experience: { years: 5, positions: [] },
        education: [],
        strengths: [],
        weaknesses: [],
        recommendation: 'Apto',
        fitScore: 80,
      }
    }
    async assistenteRH() {
      return 'Mock AI response'
    }
  }
}))

jest.mock('../lib/notifications', () => {
  const mockResolvedTrue: jest.MockedFunction<() => Promise<boolean>> = jest.fn(async () => true)
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      sendEmail: mockResolvedTrue,
      sendSMS: mockResolvedTrue,
      sendPush: mockResolvedTrue,
    }))
  }
})