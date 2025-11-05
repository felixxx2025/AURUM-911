import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { ComplianceManager, DataCategory, ProcessingPurpose } from '../lib/compliance'

export async function complianceRoutes(fastify: FastifyInstance) {
  const compliance = new ComplianceManager()

  fastify.post('/api/v1/compliance/data-processing', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        userId: z.string().uuid(),
        dataCategory: z.nativeEnum(DataCategory),
        purpose: z.nativeEnum(ProcessingPurpose),
        legalBasis: z.string(),
        retentionPeriod: z.number().positive(),
        consentGiven: z.boolean().optional(),
      })
    }
  }, async (request, reply) => {
    const record = {
      ...request.body,
      tenantId: request.user.tenantId,
      consentDate: request.body.consentGiven ? new Date() : undefined,
    }

    await compliance.recordDataProcessing(record)
    return reply.code(201).send({ success: true })
  })

  fastify.get('/api/v1/compliance/data-export/:userId', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { userId } = request.params
    return await compliance.requestDataExport(userId, request.user.tenantId)
  })

  fastify.post('/api/v1/compliance/data-deletion', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        userId: z.string().uuid(),
        reason: z.string().min(10),
      })
    }
  }, async (request, reply) => {
    const { userId, reason } = request.body
    const deletionRequest = await compliance.requestDataDeletion(
      userId,
      request.user.tenantId,
      reason
    )
    return reply.code(201).send(deletionRequest)
  })

  fastify.get('/api/v1/compliance/consent/:userId', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { userId } = request.params
    return await compliance.getConsentStatus(userId, request.user.tenantId)
  })

  fastify.put('/api/v1/compliance/consent/:userId', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        dataCategory: z.nativeEnum(DataCategory),
        consent: z.boolean(),
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params
    const { dataCategory, consent } = request.body
    
    await compliance.updateConsent(userId, request.user.tenantId, dataCategory, consent)
    return reply.send({ success: true })
  })

  fastify.get('/api/v1/compliance/retention-check', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const expiredCount = await compliance.checkRetentionPolicies(request.user.tenantId)
    return { expiredRecords: expiredCount }
  })
}