import { z } from 'zod'

export const CreateReportSchema = z.object({
  title: z.string().min(3, 'Report title must be at least 3 characters'),
  reportType: z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM']),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  platforms: z.array(z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS'])).optional(),
  metrics: z.array(z.enum(['impressions', 'clicks', 'spend', 'conversions', 'ctr', 'cpc', 'cpa'])).optional(),
  includeCharts: z.boolean().default(true),
  emailRecipients: z.array(z.string().email()).optional()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
}).refine((data) => {
  if (data.reportType === 'CUSTOM') {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 365 // Max 1 year for custom reports
  }
  return true
}, {
  message: "Custom reports cannot exceed 365 days",
  path: ["endDate"]
})

export const UpdateReportSchema = z.object({
  title: z.string().min(3, 'Report title must be at least 3 characters').optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  platforms: z.array(z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS'])).optional(),
  metrics: z.array(z.enum(['impressions', 'clicks', 'spend', 'conversions', 'ctr', 'cpc', 'cpa'])).optional(),
  includeCharts: z.boolean().optional(),
  emailRecipients: z.array(z.string().email()).optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return start <= end
  }
  return true
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
})

export const ReportsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  reportType: z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'reportType']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export const ReportIdSchema = z.object({
  reportId: z.string().cuid('Invalid report ID format')
})

export const GenerateReportSchema = z.object({
  format: z.enum(['json', 'pdf', 'csv']).optional().default('json'),
  emailReport: z.boolean().optional().default(false),
  emailRecipients: z.array(z.string().email()).optional()
}).refine((data) => {
  if (data.emailReport && (!data.emailRecipients || data.emailRecipients.length === 0)) {
    return false
  }
  return true
}, {
  message: "Email recipients are required when emailReport is true",
  path: ["emailRecipients"]
})

export const BulkReportActionSchema = z.object({
  reportIds: z.array(z.string().cuid()),
  action: z.enum(['delete', 'regenerate', 'email']),
  confirmAction: z.boolean().refine(val => val === true, {
    message: 'Action must be confirmed'
  }),
  emailRecipients: z.array(z.string().email()).optional()
}).refine((data) => {
  if (data.action === 'email' && (!data.emailRecipients || data.emailRecipients.length === 0)) {
    return false
  }
  return true
}, {
  message: "Email recipients are required for email action",
  path: ["emailRecipients"]
})

export type CreateReportData = z.infer<typeof CreateReportSchema>
export type UpdateReportData = z.infer<typeof UpdateReportSchema>
export type ReportsQuery = z.infer<typeof ReportsQuerySchema>
export type ReportId = z.infer<typeof ReportIdSchema>
export type GenerateReportData = z.infer<typeof GenerateReportSchema>
export type BulkReportAction = z.infer<typeof BulkReportActionSchema>