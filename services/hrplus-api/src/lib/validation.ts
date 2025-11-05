import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const employeeSchema = z.object({
  first_name: z.string().min(1, 'Nome é obrigatório'),
  last_name: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  phone: z.string().optional(),
  hire_date: z.string().datetime().optional(),
  salary: z.number().positive().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active')
})

export const employeeUpdateSchema = employeeSchema.partial()

export const tenantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras, números e hífens'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos').optional(),
  plan: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').default('#3b82f6')
})

export const timePunchSchema = z.object({
  employee_id: z.string().uuid('employee_id inválido'),
  ts: z.coerce.date(),
  type: z.enum(['in', 'out']),
  location: z.any().optional(),
  bio_proof: z.any().optional()
})

export const partnerEligibilitySchema = z.object({
  employee_id: z.string().uuid('employee_id inválido'),
  product: z.string().default('consigned-loan'),
  requested_amount: z.number().positive().optional()
})

export const transferSchema = z.object({
  from_account: z.string().min(1, 'Conta de origem obrigatória'),
  to_account: z.string().min(1, 'Conta de destino obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  currency: z.string().length(3, 'Moeda deve ter 3 letras').default('BRL'),
  reference: z.string().optional()
})