import { PrismaClient, ClientStatus, Platform, SyncStatus, CampaignStatus, ReportType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting main database seed...')

  // Note: User creation is now handled by the customer database
  // This seed file only creates business logic data

  // Create sample clients (referencing users from customer database)
  const client1 = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      userId: 'cmfp906mo0000sd7hh4mvsr3f', // Admin user ID from customer database
      businessName: 'Acme Corporation',
      businessEmail: 'contact@acme.com',
      businessPhone: '+1-555-0123',
      businessWebsite: 'https://acme.com',
      industry: 'Technology',
      status: ClientStatus.ACTIVE,
      subscriptionPlan: 'ENTERPRISE',
    },
  })

  const client2 = await prisma.client.upsert({
    where: { id: 'client-2' },
    update: {},
    create: {
      id: 'client-2',
      userId: 'cmfp906ns0002sd7hykagwynf', // Client user ID from customer database
      businessName: 'TechStart Inc',
      businessEmail: 'hello@techstart.com',
      businessPhone: '+1-555-0456',
      businessWebsite: 'https://techstart.com',
      industry: 'SaaS',
      status: ClientStatus.ACTIVE,
      subscriptionPlan: 'PROFESSIONAL',
    },
  })

  // Create OAuth integrations
  await prisma.oAuthIntegration.upsert({
    where: { id: 'integration-1' },
    update: {},
    create: {
      id: 'integration-1',
      userId: 'cmfp906mo0000sd7hh4mvsr3f',
      platform: Platform.GOOGLE_ADS,
      accessToken: 'encrypted-access-token',
      refreshToken: 'encrypted-refresh-token',
      tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      accountId: '123456789',
      accountName: 'Acme Corp Google Ads',
      scopes: ['read', 'write'],
      isActive: true,
      syncStatus: SyncStatus.IDLE,
    },
  })

  // Create sample campaigns
  const campaign1 = await prisma.campaign.upsert({
    where: { id: 'campaign-1' },
    update: {},
    create: {
      id: 'campaign-1',
      userId: 'cmfp906mo0000sd7hh4mvsr3f',
      platform: Platform.GOOGLE_ADS,
      platformCampaignId: '123456789',
      name: 'Summer Sale Campaign',
      status: CampaignStatus.ACTIVE,
      objective: 'SALES',
      budgetDaily: 100.00,
      budgetTotal: 3000.00,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
    },
  })

  const campaign2 = await prisma.campaign.upsert({
    where: { id: 'campaign-2' },
    update: {},
    create: {
      id: 'campaign-2',
      userId: 'cmfp906ns0002sd7hykagwynf',
      platform: Platform.META_ADS,
      platformCampaignId: '987654321',
      name: 'Brand Awareness Campaign',
      status: CampaignStatus.ACTIVE,
      objective: 'BRAND_AWARENESS',
      budgetDaily: 50.00,
      budgetTotal: 1500.00,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-09-30'),
    },
  })

  // Create sample analytics data
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  await prisma.analyticsData.upsert({
    where: { id: 'analytics-1' },
    update: {},
    create: {
      id: 'analytics-1',
      userId: 'cmfp906mo0000sd7hh4mvsr3f',
      campaignId: campaign1.id,
      platform: Platform.GOOGLE_ADS,
      date: yesterday,
      impressions: 15000,
      clicks: 450,
      spend: 89.50,
      conversions: 12,
      cpc: 0.20,
      cpa: 7.46,
      ctr: 3.0,
      platformMetrics: {
        qualityScore: 8.5,
        avgPosition: 2.1,
        searchImpressionShare: 0.75
      },
    },
  })

  await prisma.analyticsData.upsert({
    where: { id: 'analytics-2' },
    update: {},
    create: {
      id: 'analytics-2',
      userId: 'cmfp906ns0002sd7hykagwynf',
      campaignId: campaign2.id,
      platform: Platform.META_ADS,
      date: yesterday,
      impressions: 25000,
      clicks: 800,
      spend: 45.20,
      conversions: 8,
      cpc: 0.06,
      cpa: 5.65,
      ctr: 3.2,
      platformMetrics: {
        reach: 18000,
        frequency: 1.39,
        relevanceScore: 8.0
      },
    },
  })

  // Create sample reports
  await prisma.report.upsert({
    where: { id: 'report-1' },
    update: {},
    create: {
      id: 'report-1',
      userId: 'cmfp906mo0000sd7hh4mvsr3f',
      title: 'Monthly Performance Report - July 2024',
      reportType: ReportType.MONTHLY,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-31'),
      data: {
        summary: {
          totalSpend: 2450.75,
          totalImpressions: 450000,
          totalClicks: 12500,
          totalConversions: 180,
          avgCpc: 0.20,
          avgCpa: 13.62
        },
        campaigns: [
          {
            name: 'Summer Sale Campaign',
            spend: 1500.00,
            conversions: 120,
            cpa: 12.50
          },
          {
            name: 'Brand Awareness Campaign',
            spend: 950.75,
            conversions: 60,
            cpa: 15.85
          }
        ]
      },
    },
  })

  console.log('✅ Main database seeded successfully!')
  console.log('📊 Created sample data for campaigns, analytics, and reports')
  console.log('⚠️  Note: User data is now managed by the customer database')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding main database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })