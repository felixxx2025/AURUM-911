import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export function toJsonSchema(schema: z.ZodTypeAny, name?: string) {
  // Gera JSON Schema compatível com Fastify/OpenAPI
  return zodToJsonSchema(schema, name ? { name } : undefined)
}
