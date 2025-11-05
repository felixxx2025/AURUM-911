import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (app) => {
  if (!process.env.DATABASE_URL) {
    // Sem DATABASE_URL, não configura Prisma (modo in-memory/testing)
    return
  }

  const prisma = new PrismaClient()
  await prisma.$connect()

  app.decorate('prisma', prisma)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
