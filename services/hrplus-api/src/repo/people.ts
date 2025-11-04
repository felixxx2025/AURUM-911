import { randomUUID } from 'crypto'

export type Person = {
  id: string
  tenant_id: string
  first_name?: string
  last_name?: string
  email?: string
}

export type ListResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface PeopleRepo {
  list(tenantId: string, page?: number, pageSize?: number): Promise<ListResult<Person>>
  get(tenantId: string, id: string): Promise<Person | null>
  create(tenantId: string, data: Omit<Person, 'id' | 'tenant_id'>): Promise<Person>
  update(
    tenantId: string,
    id: string,
    data: Partial<Omit<Person, 'id' | 'tenant_id'>>,
  ): Promise<Person | null>
}

// In-memory fallback for dev without DB
export class InMemoryPeopleRepo implements PeopleRepo {
  private store = new Map<string, Map<string, Person>>() // tenantId -> (id -> person)

  private ensureTenant(tenantId: string) {
    if (!this.store.has(tenantId)) this.store.set(tenantId, new Map())
    return this.store.get(tenantId)!
  }

  async list(tenantId: string, page = 1, pageSize = 20): Promise<ListResult<Person>> {
    const t = this.ensureTenant(tenantId)
    const all = Array.from(t.values())
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)
    return { items, page, pageSize, total: all.length }
  }

  async get(tenantId: string, id: string): Promise<Person | null> {
    const t = this.ensureTenant(tenantId)
    return t.get(id) || null
  }

  async create(
    tenantId: string,
    data: Omit<Person, 'id' | 'tenant_id'>,
  ): Promise<Person> {
    const t = this.ensureTenant(tenantId)
    const p: Person = { id: randomUUID(), tenant_id: tenantId, ...data }
    t.set(p.id, p)
    return p
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<Person, 'id' | 'tenant_id'>>,
  ): Promise<Person | null> {
    const t = this.ensureTenant(tenantId)
    const curr = t.get(id)
    if (!curr) return null
    const upd = { ...curr, ...data }
    t.set(id, upd)
    return upd
  }
}

// Prisma-backed implementation (used when DATABASE_URL is set)
export class PrismaPeopleRepo implements PeopleRepo {
  private prisma: any
  constructor(prismaClient: any) {
    this.prisma = prismaClient
  }

  async list(tenantId: string, page = 1, pageSize = 20): Promise<ListResult<Person>> {
    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      this.prisma.employee.count({ where: { tenantId } }),
    ])
    return {
      items: items.map((e: any) => ({
        id: e.id,
        tenant_id: e.tenantId,
        first_name: e.firstName ?? undefined,
        last_name: e.lastName ?? undefined,
        email: e.email ?? undefined,
      })),
      page,
      pageSize,
      total,
    }
  }

  async get(tenantId: string, id: string): Promise<Person | null> {
    const e = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      select: { id: true, tenantId: true, firstName: true, lastName: true, email: true },
    })
    if (!e) return null
    return {
      id: e.id,
      tenant_id: e.tenantId,
      first_name: e.firstName ?? undefined,
      last_name: e.lastName ?? undefined,
      email: e.email ?? undefined,
    }
  }

  async create(tenantId: string, data: Omit<Person, 'id' | 'tenant_id'>): Promise<Person> {
    // Ensure tenant exists to satisfy FK
    await this.prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Default' },
    })

    const e = await this.prisma.employee.create({
      data: {
        id: randomUUID(),
        tenantId,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        email: data.email ?? null,
      },
      select: { id: true, tenantId: true, firstName: true, lastName: true, email: true },
    })
    return {
      id: e.id,
      tenant_id: e.tenantId,
      first_name: e.firstName ?? undefined,
      last_name: e.lastName ?? undefined,
      email: e.email ?? undefined,
    }
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<Person, 'id' | 'tenant_id'>>,
  ): Promise<Person | null> {
    const exists = await this.get(tenantId, id)
    if (!exists) return null
    const e = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.first_name ?? undefined,
        lastName: data.last_name ?? undefined,
        email: data.email ?? undefined,
      },
      select: { id: true, tenantId: true, firstName: true, lastName: true, email: true },
    })
    return {
      id: e.id,
      tenant_id: e.tenantId,
      first_name: e.firstName ?? undefined,
      last_name: e.lastName ?? undefined,
      email: e.email ?? undefined,
    }
  }
}
