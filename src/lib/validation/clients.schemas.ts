import { z } from 'zod'

export const CreateClientSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(255),
  businessEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  subscriptionPlan: z.string().optional(),
})

export const UpdateClientSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(255).optional(),
  businessEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'INACTIVE']).optional(),
  subscriptionPlan: z.string().optional(),
})

export const ClientQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'TRIAL', 'INACTIVE']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
export type ClientQueryInput = z.infer<typeof ClientQuerySchema>