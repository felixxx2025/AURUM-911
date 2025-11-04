/* eslint-disable */
const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL ausente; seed ignorado.')
    return
  }
  const prisma = new PrismaClient()
  const tenantId = randomUUID()
  await prisma.tenant.create({ data: { id: tenantId, name: 'Demo Corp' } })
  await prisma.employee.create({
    data: {
      id: randomUUID(),
      tenantId,
      firstName: 'Alice',
      lastName: 'Silva',
      email: 'alice@example.com',
    },
  })
  await prisma.employee.create({
    data: {
      id: randomUUID(),
      tenantId,
      firstName: 'Bruno',
      lastName: 'Souza',
      email: 'bruno@example.com',
    },
  })
  await prisma.$disconnect()
  console.log('Seed concluído com tenantId:', tenantId)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
