import { User, Client, Campaign, AnalyticsData, OAuthIntegration, Report } from '@prisma/client'

// User factory
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  password: null,
  image: null,
  role: 'CLIENT',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Client factory
export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-1',
  userId: 'user-1',
  businessName: 'Test Business',
  businessEmail: 'business@example.com',
  businessPhone: '+1234567890',
  businessWebsite: 'https://example.com',
  industry: 'Technology',
  status: 'ACTIVE',
  subscriptionPlan: 'PRO',
  lastLoginAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Campaign factory
export const createMockCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  id: 'campaign-1',
  userId: 'user-1',
  platform: 'GOOGLE_ADS',
  platformCampaignId: 'google-campaign-123',
  name: 'Test Campaign',
  status: 'ACTIVE',
  objective: 'CONVERSIONS',
  budgetDaily: 100.00,
  budgetTotal: 3000.00,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Analytics Data factory
export const createMockAnalyticsData = (overrides: Partial<AnalyticsData> = {}): AnalyticsData => ({
  id: 'analytics-1',
  userId: 'user-1',
  campaignId: 'campaign-1',
  platform: 'GOOGLE_ADS',
  date: new Date('2024-01-01'),
  impressions: 1000,
  clicks: 50,
  spend: 25.50,
  conversions: 5,
  cpc: 0.51,
  cpa: 5.10,
  ctr: 5.0,
  platformMetrics: {
    qualityScore: 8,
    adPosition: 1.2,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// OAuth Integration factory
export const createMockOAuthIntegration = (overrides: Partial<OAuthIntegration> = {}): OAuthIntegration => ({
  id: 'oauth-1',
  userId: 'user-1',
  platform: 'GOOGLE_ADS',
  accessToken: 'encrypted-access-token',
  refreshToken: 'encrypted-refresh-token',
  tokenExpiresAt: new Date('2024-12-31'),
  accountId: 'google-account-123',
  accountName: 'Test Google Account',
  scopes: ['https://www.googleapis.com/auth/adwords'],
  isActive: true,
  syncStatus: 'IDLE',
  lastSyncAt: new Date('2024-01-01'),
  lastError: null,
  metadata: {
    customerId: '123-456-7890',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Report factory
export const createMockReport = (overrides: Partial<Report> = {}): Report => ({
  id: 'report-1',
  userId: 'user-1',
  title: 'Weekly Performance Report',
  reportType: 'WEEKLY',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-07'),
  data: {
    totalSpend: 500.00,
    totalClicks: 1000,
    totalImpressions: 20000,
    totalConversions: 50,
  },
  emailSentAt: new Date('2024-01-08'),
  createdAt: new Date('2024-01-08'),
  ...overrides,
})

// Mock API Response factory
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : 'Test error message',
  timestamp: new Date().toISOString(),
})

// Mock Session factory
export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
  },
  expires: '2024-12-31T23:59:59.999Z',
  ...overrides,
})

// Mock Request factory
export const createMockRequest = (overrides: Partial<Request> = {}) => {
  const url = overrides.url || 'http://localhost:3000/api/test'
  const method = overrides.method || 'GET'
  
  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...overrides.headers,
    },
    body: overrides.body,
  })
}

// Mock NextRequest factory for API routes
export const createMockNextRequest = (
  url = 'http://localhost:3000/api/test',
  options: RequestInit = {}
) => {
  return new Request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
}