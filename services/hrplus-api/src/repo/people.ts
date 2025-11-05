/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'

export type Person = {
  id: string
  tenant_id: string
  first_name?: string
  last_name?: string
  email?: string
  created_at?: string
}

export type ListResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface PeopleRepo {
  list(tenantId: string, page?: number, pageSize?: number, filter?: string): Promise<ListResult<Person>>
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

  async list(tenantId: string, page = 1, pageSize = 20, filter?: string): Promise<ListResult<Person>> {
    const t = this.ensureTenant(tenantId)
    const all = Array.from(t.values())
    const q = (filter || '').trim().toLowerCase()
    const filtered = q
      ? all.filter(p => [p.first_name, p.last_name, p.email]
          .some(v => (v || '').toLowerCase().includes(q)))
      : all
    // Ordena por created_at desc para alinhar com Prisma
    const sorted = [...filtered].sort((a, b) => {
      const aTs = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTs = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTs - aTs
    })
    const start = (page - 1) * pageSize
    const items = sorted.slice(start, start + pageSize)
    return { items, page, pageSize, total: filtered.length }
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
    const p: Person = { id: randomUUID(), tenant_id: tenantId, created_at: new Date().toISOString(), ...data }
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

  async list(tenantId: string, page = 1, pageSize = 20, filter?: string): Promise<ListResult<Person>> {
    const where = {
      tenant_id: tenantId,
      ...(filter
        ? {
            OR: [
              { first_name: { contains: filter, mode: 'insensitive' } },
              { last_name: { contains: filter, mode: 'insensitive' } },
              { email: { contains: filter, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          tenant_id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
        },
      }),
      this.prisma.employee.count({ where }),
    ])
    return {
      items: items.map((e: any) => ({
        id: e.id,
        tenant_id: e.tenant_id,
        first_name: e.first_name ?? undefined,
        last_name: e.last_name ?? undefined,
        email: e.email ?? undefined,
        created_at: e.created_at ? new Date(e.created_at).toISOString() : undefined,
      })),
      page,
      pageSize,
      total,
    }
  }

  async get(tenantId: string, id: string): Promise<Person | null> {
    const e = await this.prisma.employee.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true, tenant_id: true, first_name: true, last_name: true, email: true, created_at: true },
    })
    if (!e) return null
    return {
      id: e.id,
      tenant_id: e.tenant_id,
      first_name: e.first_name ?? undefined,
      last_name: e.last_name ?? undefined,
      email: e.email ?? undefined,
      created_at: e.created_at ? new Date(e.created_at).toISOString() : undefined,
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
        tenant_id: tenantId,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        email: data.email ?? null,
      },
      select: { id: true, tenant_id: true, first_name: true, last_name: true, email: true, created_at: true },
    })
    return {
      id: e.id,
      tenant_id: e.tenant_id,
      first_name: e.first_name ?? undefined,
      last_name: e.last_name ?? undefined,
      email: e.email ?? undefined,
      created_at: e.created_at ? new Date(e.created_at).toISOString() : undefined,
    }
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<Person, 'id' | 'tenant_id'>>,
  ): Promise<Person | null> {
    // Usa updateMany para permitir filtro por (id, tenant_id) sem depender de chave única composta
    const res = await this.prisma.employee.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        first_name: data.first_name ?? undefined,
        last_name: data.last_name ?? undefined,
        email: data.email ?? undefined,
      },
    })
    if (res.count === 0) return null

    const e = await this.prisma.employee.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true, tenant_id: true, first_name: true, last_name: true, email: true, created_at: true },
    })
    if (!e) return null
    return {
      id: e.id,
      tenant_id: e.tenant_id,
      first_name: e.first_name ?? undefined,
      last_name: e.last_name ?? undefined,
      email: e.email ?? undefined,
      created_at: e.created_at ? new Date(e.created_at).toISOString() : undefined,
    }
  }
}
