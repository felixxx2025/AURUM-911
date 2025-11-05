import { prisma } from '../plugins/prisma'

export class QueryOptimizer {
  private queryCache = new Map<string, { result: any; expiry: number }>()

  async optimizedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    const cached = this.queryCache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.result
    }

    const result = await queryFn()
    this.queryCache.set(key, {
      result,
      expiry: Date.now() + ttl
    })

    return result
  }

  async batchUsers(tenantId: string, userIds: string[]) {
    return await prisma.user.findMany({
      where: { id: { in: userIds }, tenantId },
      select: { id: true, name: true, email: true }
    })
  }

  async getEmployeeStats(tenantId: string) {
    return await this.optimizedQuery(
      `employee_stats_${tenantId}`,
      () => prisma.employee.groupBy({
        by: ['department'],
        where: { tenantId },
        _count: { id: true },
        _avg: { salary: true }
      })
    )
  }
}