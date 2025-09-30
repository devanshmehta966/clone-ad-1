import { PrismaClient } from '../node_modules/.prisma/customer-client'
import { hash } from 'argon2'

const customerPrisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding customer database...')

  // Create a test admin user
  const adminPassword = await hash('admin123')
  const admin = await customerPrisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      id: 'cmfp906mo0000sd7hh4mvsr3f',
      profile: {
        create: {
          fullName: 'Admin User',
          businessName: 'Admin Business',
          businessEmail: 'admin@example.com',
          businessPhone: '+1234567890',
          businessWebsite: 'https://admin.example.com',
          subscriptionPlan: 'premium',
          emailAlerts: true,
          weeklyReports: true,
          budgetAlerts: true,
          performanceAlerts: true,
        },
      },
    },
    include: {
      profile: true,
    },
  })

  // Create a test client user
  const clientPassword = await hash('client123')
  const client = await customerPrisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Client User',
      id: 'cmfp906ns0002sd7hykagwynf',
      password: clientPassword,
      role: 'CLIENT',
      profile: {
        create: {
          fullName: 'Client User',
          businessName: 'Client Business',
          businessEmail: 'client@example.com',
          businessPhone: '+1234567891',
          businessWebsite: 'https://client.example.com',
          subscriptionPlan: 'basic',
          emailAlerts: true,
          weeklyReports: false,
          budgetAlerts: true,
          performanceAlerts: false,
        },
      },
    },
    include: {
      profile: true,
    },
  })

  console.log('✅ Customer database seeded successfully!')
  console.log('👤 Admin user created:', admin.email)
  console.log('👤 Client user created:', client.email)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding customer database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await customerPrisma.$disconnect()
  })
