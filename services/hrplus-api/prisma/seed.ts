import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Empresa Demo',
      subdomain: 'demo',
      cnpj: '12345678000199',
      plan: 'pro',
      primary_color: '#3b82f6'
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.aurum.cool' },
    update: {},
    create: {
      email: 'admin@demo.aurum.cool',
      password: hashedPassword,
      name: 'Admin Demo',
      role: 'TENANT_ADMIN',
      tenant_id: tenant.id
    }
  })

  // Create sample employees
  const employees = [
    {
      first_name: 'João',
      last_name: 'Silva',
      email: 'joao.silva@demo.aurum.cool',
      cpf: '12345678901',
      department: 'Tecnologia',
      position: 'Desenvolvedor Senior',
      salary: 8000,
      hire_date: new Date('2023-01-15')
    },
    {
      first_name: 'Maria',
      last_name: 'Santos',
      email: 'maria.santos@demo.aurum.cool',
      cpf: '98765432109',
      department: 'RH',
      position: 'Analista de RH',
      salary: 5500,
      hire_date: new Date('2023-03-20')
    },
    {
      first_name: 'Pedro',
      last_name: 'Costa',
      email: 'pedro.costa@demo.aurum.cool',
      cpf: '11122233344',
      department: 'Financeiro',
      position: 'Controller',
      salary: 7200,
      hire_date: new Date('2022-11-10')
    }
  ]

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { 
        tenant_id_cpf: { 
          tenant_id: tenant.id, 
          cpf: emp.cpf 
        } 
      },
      update: {},
      create: {
        ...emp,
        tenant_id: tenant.id
      }
    })
  }

  console.log('✅ Seed completed!')
  console.log('🏢 Tenant: demo.aurum.cool')
  console.log('👤 Admin: admin@demo.aurum.cool / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })