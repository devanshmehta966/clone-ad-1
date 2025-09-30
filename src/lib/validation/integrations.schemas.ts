import { z } from 'zod'

export const OAuthStartSchema = z.object({
  provider: z.enum(['google', 'facebook', 'linkedin'], {
    errorMap: () => ({ message: 'Provider must be one of: google, facebook, linkedin' })
  })
})

export const OAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
  provider: z.enum(['google', 'facebook', 'linkedin']),
  error: z.string().optional(),
  error_description: z.string().optional()
})

export const IntegrationIdSchema = z.object({
  integrationId: z.string().cuid('Invalid integration ID format')
})

export const SyncIntegrationSchema = z.object({
  force: z.boolean().optional().default(false),
  syncType: z.enum(['full', 'incremental']).optional().default('incremental')
})

export const IntegrationsQuerySchema = z.object({
  platform: z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS']).optional(),
  isActive: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
  syncStatus: z.enum(['IDLE', 'SYNCING', 'ERROR', 'PENDING_AUTH']).optional()
})

export const UpdateIntegrationSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').optional(),
  isActive: z.boolean().optional(),
  syncSettings: z.object({
    autoSync: z.boolean().optional(),
    syncFrequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
    syncMetrics: z.array(z.string()).optional()
  }).optional()
})

export const DisconnectIntegrationSchema = z.object({
  confirmDisconnect: z.boolean().refine(val => val === true, {
    message: 'Disconnection must be confirmed'
  })
})

export type OAuthStartData = z.infer<typeof OAuthStartSchema>
export type OAuthCallbackData = z.infer<typeof OAuthCallbackSchema>
export type IntegrationId = z.infer<typeof IntegrationIdSchema>
export type SyncIntegrationData = z.infer<typeof SyncIntegrationSchema>
export type IntegrationsQuery = z.infer<typeof IntegrationsQuerySchema>
export type UpdateIntegrationData = z.infer<typeof UpdateIntegrationSchema>
export type DisconnectIntegrationData = z.infer<typeof DisconnectIntegrationSchema>