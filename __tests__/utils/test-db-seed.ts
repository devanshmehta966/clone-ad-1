import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import {
  createMockUser,
  createMockClient,
  createMockCampaign,
  createMockAnalyticsData,
  createMockOAuthIntegration,
  createMockReport,
} from './test-factories'

const prisma = new PrismaClient()

export async function seedTestDatabase() {
  try {
    // Clean existing data
    await prisma.report.deleteMany()
    await prisma.analyticsData.deleteMany()
    await prisma.oAuthIntegration.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.client.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()

    // Create test users
    const hashedPassword = await hash('password123')
    
    const testUser1 = await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test1@example.com',
        name: 'Test User 1',
        password: hashedPassword,
        role: 'CLIENT',
        profile: {
          create: {
            fullName: 'Test User 1',
            businessName: 'Test Business 1',
            businessEmail: 'business1@example.com',
            businessPhone: '+1234567890',
            businessWebsite: 'https://testbusiness1.com',
            subscriptionPlan: 'PRO',
          },
        },
      },
    })

    const testUser2 = await prisma.user.create({
      data: {
        id: 'test-user-2',
        email: 'test2@example.com',
        name: 'Test User 2',
        password: hashedPassword,
        role: 'CLIENT',
        profile: {
          create: {
            fullName: 'Test User 2',
            businessName: 'Test Business 2',
            businessEmail: 'business2@example.com',
            businessPhone: '+0987654321',
            businessWebsite: 'https://testbusiness2.com',
            subscriptionPlan: 'BASIC',
          },
        },
      },
    })

    // Create OAuth user (no password)
    const oauthUser = await prisma.user.create({
      data: {
        id: 'oauth-user-1',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
        role: 'CLIENT',
        image: 'https://example.com/avatar.jpg',
        profile: {
          create: {
            fullName: 'OAuth User',
            businessName: 'OAuth Business',
            businessEmail: 'oauth@example.com',
            subscriptionPlan: 'PRO',
          },
        },
      },
    })

    // Create test clients
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          id: 'test-client-1',
          userId: testUser1.id,
          businessName: 'Client Business 1',
          businessEmail: 'client1@example.com',
          businessPhone: '+1111111111',
          businessWebsite: 'https://client1.com',
          industry: 'Technology',
          status: 'ACTIVE',
          subscriptionPlan: 'PRO',
          lastLoginAt: new Date(),
        },
      }),
      prisma.client.create({
        data: {
          id: 'test-client-2',
          userId: testUser1.id,
          businessName: 'Client Business 2',
          businessEmail: 'client2@example.com',
          businessPhone: '+2222222222',
          businessWebsite: 'https://client2.com',
          industry: 'Healthcare',
          status: 'TRIAL',
          subscriptionPlan: 'BASIC',
          lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
      }),
      prisma.client.create({
        data: {
          id: 'test-client-3',
          userId: testUser2.id,
          businessName: 'Client Business 3',
          businessEmail: 'client3@example.com',
          businessPhone: '+3333333333',
          businessWebsite: 'https://client3.com',
          industry: 'Finance',
          status: 'INACTIVE',
          subscriptionPlan: 'BASIC',
          lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Week ago
        },
      }),
    ])

    // Create OAuth integrations
    const integrations = await Promise.all([
      prisma.oAuthIntegration.create({
        data: {
          id: 'integration-1',
          userId: testUser1.id,
          platform: 'GOOGLE_ADS',
          accessToken: 'encrypted-google-token',
          refreshToken: 'encrypted-google-refresh',
          tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          accountId: 'google-account-123',
          accountName: 'Test Google Ads Account',
          scopes: ['https://www.googleapis.com/auth/adwords'],
          isActive: true,
          syncStatus: 'IDLE',
          lastSyncAt: new Date(),
          metadata: { customerId: '123-456-7890' },
        },
      }),
      prisma.oAuthIntegration.create({
        data: {
          id: 'integration-2',
          userId: testUser1.id,
          platform: 'META_ADS',
          accessToken: 'encrypted-meta-token',
          refreshToken: 'encrypted-meta-refresh',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          accountId: 'meta-account-456',
          accountName: 'Test Meta Ads Account',
          scopes: ['ads_management', 'ads_read'],
          isActive: true,
          syncStatus: 'IDLE',
          lastSyncAt: new Date(),
          metadata: { adAccountId: 'act_123456789' },
        },
      }),
    ])

    // Create campaigns
    const campaigns = await Promise.all([
      prisma.campaign.create({
        data: {
          id: 'campaign-1',
          userId: testUser1.id,
          platform: 'GOOGLE_ADS',
          platformCampaignId: 'google-campaign-123',
          name: 'Google Search Campaign',
          status: 'ACTIVE',
          objective: 'CONVERSIONS',
          budgetDaily: 100.00,
          budgetTotal: 3000.00,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        },
      }),
      prisma.campaign.create({
        data: {
          id: 'campaign-2',
          userId: testUser1.id,
          platform: 'META_ADS',
          platformCampaignId: 'meta-campaign-456',
          name: 'Facebook Lead Generation',
          status: 'ACTIVE',
          objective: 'LEAD_GENERATION',
          budgetDaily: 75.00,
          budgetTotal: 2250.00,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        },
      }),
      prisma.campaign.create({
        data: {
          id: 'campaign-3',
          userId: testUser2.id,
          platform: 'LINKEDIN_ADS',
          platformCampaignId: 'linkedin-campaign-789',
          name: 'LinkedIn Sponsored Content',
          status: 'PAUSED',
          objective: 'BRAND_AWARENESS',
          budgetDaily: 50.00,
          budgetTotal: 1500.00,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        },
      }),
    ])

    // Create analytics data for the last 30 days
    const analyticsData = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Google Ads data
      analyticsData.push({
        userId: testUser1.id,
        campaignId: campaigns[0].id,
        platform: 'GOOGLE_ADS' as const,
        date,
        impressions: Math.floor(Math.random() * 5000) + 1000,
        clicks: Math.floor(Math.random() * 250) + 50,
        spend: Math.random() * 100 + 20,
        conversions: Math.floor(Math.random() * 20) + 2,
        cpc: Math.random() * 2 + 0.5,
        cpa: Math.random() * 50 + 10,
        ctr: Math.random() * 5 + 2,
        platformMetrics: {
          qualityScore: Math.floor(Math.random() * 5) + 5,
          adPosition: Math.random() * 2 + 1,
        },
      })

      // Meta Ads data
      analyticsData.push({
        userId: testUser1.id,
        campaignId: campaigns[1].id,
        platform: 'META_ADS' as const,
        date,
        impressions: Math.floor(Math.random() * 8000) + 2000,
        clicks: Math.floor(Math.random() * 400) + 100,
        spend: Math.random() * 75 + 15,
        conversions: Math.floor(Math.random() * 15) + 3,
        cpc: Math.random() * 1.5 + 0.3,
        cpa: Math.random() * 40 + 8,
        ctr: Math.random() * 4 + 1.5,
        platformMetrics: {
          relevanceScore: Math.floor(Math.random() * 5) + 5,
          frequency: Math.random() * 3 + 1,
        },
      })
    }

    await prisma.analyticsData.createMany({
      data: analyticsData,
    })

    // Create test reports
    await Promise.all([
      prisma.report.create({
        data: {
          id: 'report-1',
          userId: testUser1.id,
          title: 'Weekly Performance Report',
          reportType: 'WEEKLY',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-07'),
          data: {
            totalSpend: 500.00,
            totalClicks: 1000,
            totalImpressions: 20000,
            totalConversions: 50,
            platforms: ['GOOGLE_ADS', 'META_ADS'],
          },
          emailSentAt: new Date(),
        },
      }),
      prisma.report.create({
        data: {
          id: 'report-2',
          userId: testUser1.id,
          title: 'Monthly Performance Report',
          reportType: 'MONTHLY',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          data: {
            totalSpend: 2000.00,
            totalClicks: 4000,
            totalImpressions: 80000,
            totalConversions: 200,
            platforms: ['GOOGLE_ADS', 'META_ADS'],
          },
          emailSentAt: null, // Not sent yet
        },
      }),
    ])

    console.log('Test database seeded successfully!')
    console.log(`Created ${analyticsData.length} analytics data points`)
    console.log('Test users:', [testUser1.email, testUser2.email, oauthUser.email])
    
  } catch (error) {
    console.error('Error seeding test database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export async function clearTestDatabase() {
  try {
    await prisma.report.deleteMany()
    await prisma.analyticsData.deleteMany()
    await prisma.oAuthIntegration.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.client.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('Test database cleared successfully!')
  } catch (error) {
    console.error('Error clearing test database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}