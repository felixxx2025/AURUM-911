// Tipamos como any para evitar dependência direta do schema Prisma aqui,
// pois esses modelos podem não existir em todos os ambientes.
type PrismaClient = any

export enum DataCategory {
  PERSONAL = 'personal',
  SENSITIVE = 'sensitive',
  FINANCIAL = 'financial',
  BIOMETRIC = 'biometric',
}

export enum ProcessingPurpose {
  CONTRACT = 'contract',
  CONSENT = 'consent',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

interface DataProcessingRecord {
  userId: string
  tenantId: string
  dataCategory: DataCategory
  purpose: ProcessingPurpose
  legalBasis: string
  retentionPeriod: number // days
  consentGiven?: boolean
  consentDate?: Date
}

export class ComplianceManager {
  constructor(private readonly prisma?: PrismaClient) {}

  private getDb(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Prisma não configurado (sem DATABASE_URL)')
    }
    return this.prisma
  }

  async recordDataProcessing(record: DataProcessingRecord) {
    const prisma = this.getDb()
    await prisma.dataProcessingLog.create({
      data: {
        userId: record.userId,
        tenantId: record.tenantId,
        dataCategory: record.dataCategory,
        purpose: record.purpose,
        legalBasis: record.legalBasis,
        retentionPeriod: record.retentionPeriod,
        consentGiven: record.consentGiven,
        consentDate: record.consentDate,
      },
    })
  }

  async requestDataExport(userId: string, tenantId: string) {
    const prisma = this.getDb()
    // Collect all user data across tables
    const [user, employees, auditLogs, processingLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.employee.findMany({ where: { tenantId, createdBy: userId } }),
      prisma.auditLog.findMany({ where: { userId, tenantId } }),
      prisma.dataProcessingLog.findMany({ where: { userId, tenantId } }),
    ])

    return {
      exportDate: new Date().toISOString(),
      userId,
      tenantId,
      data: {
        profile: user,
        employees,
        auditLogs,
        processingLogs,
      },
    }
  }

  async requestDataDeletion(userId: string, tenantId: string, reason: string) {
    const prisma = this.getDb()
    // Create deletion request
    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        userId,
        tenantId,
        reason,
        status: 'pending',
        requestDate: new Date(),
      },
    })

    // Schedule deletion job (would be processed by background worker)
    await this.scheduleDataDeletion(deletionRequest.id)

    return deletionRequest
  }

  async processDataDeletion(requestId: string) {
    const prisma = this.getDb()
    const request = await prisma.dataDeletionRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) throw new Error('Deletion request not found')

    // Anonymize or delete data based on retention policies
    await prisma.$transaction([
      // Anonymize audit logs (keep for compliance but remove PII)
      prisma.auditLog.updateMany({
        where: { userId: request.userId, tenantId: request.tenantId },
        data: { metadata: { anonymized: true } },
      }),
      
      // Delete user data that can be deleted
      prisma.employee.deleteMany({
        where: { tenantId: request.tenantId, createdBy: request.userId },
      }),
      
      // Update deletion request status
      prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: { 
          status: 'completed',
          completedDate: new Date(),
        },
      }),
    ])
  }

  async checkRetentionPolicies(tenantId: string) {
    const prisma = this.getDb()
    const expiredData = await prisma.dataProcessingLog.findMany({
      where: {
        tenantId,
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        },
      },
    })

    // Schedule cleanup for expired data
    for (const record of expiredData) {
      await this.scheduleDataDeletion(record.id)
    }

    return expiredData.length
  }

  async getConsentStatus(userId: string, tenantId: string) {
    const prisma = this.getDb()
    const consents = await prisma.dataProcessingLog.findMany({
      where: { userId, tenantId, consentGiven: true },
      select: {
        dataCategory: true,
        purpose: true,
        consentDate: true,
        legalBasis: true,
      },
    })

    return consents
  }

  async updateConsent(userId: string, tenantId: string, dataCategory: DataCategory, consent: boolean) {
    const prisma = this.getDb()
    await prisma.dataProcessingLog.updateMany({
      where: { userId, tenantId, dataCategory },
      data: {
        consentGiven: consent,
        consentDate: new Date(),
      },
    })
  }

  private async scheduleDataDeletion(recordId: string) {
    // In a real implementation, this would add to a job queue
    console.log(`Scheduled data deletion for record: ${recordId}`)
  }
}