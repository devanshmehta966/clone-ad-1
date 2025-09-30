import { z } from 'zod'

export const MetricsQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  platforms: z.array(z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS'])).optional()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
})

export const AlertsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error']).optional(),
  isRead: z.string().optional()
})

export const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "Start date must be before or equal to end date"
})

export const PlatformFilterSchema = z.object({
  platforms: z.array(z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS'])).optional(),
  campaigns: z.array(z.string()).optional()
})

export const ChartDataQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  platforms: z.array(z.enum(['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS'])).optional(),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
  metrics: z.array(z.enum(['impressions', 'clicks', 'spend', 'conversions', 'ctr', 'cpc', 'cpa'])).optional()
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
})

export type MetricsQuery = z.infer<typeof MetricsQuerySchema>
export type AlertsQuery = z.infer<typeof AlertsQuerySchema>
export type DateRange = z.infer<typeof DateRangeSchema>
export type PlatformFilter = z.infer<typeof PlatformFilterSchema>
export type ChartDataQuery = z.infer<typeof ChartDataQuerySchema>