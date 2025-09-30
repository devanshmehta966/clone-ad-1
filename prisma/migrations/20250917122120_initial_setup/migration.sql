-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."ClientStatus" AS ENUM ('ACTIVE', 'TRIAL', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'GOOGLE_ANALYTICS');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'ERROR', 'PENDING_AUTH');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "businessName" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "businessWebsite" TEXT,
    "subscriptionPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "businessWebsite" TEXT,
    "industry" TEXT,
    "status" "public"."ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscriptionPlan" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oauth_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "accountId" TEXT,
    "accountName" TEXT,
    "scopes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "platformCampaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."CampaignStatus",
    "objective" TEXT,
    "budgetDaily" DECIMAL(65,30),
    "budgetTotal" DECIMAL(65,30),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "platform" "public"."Platform" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "spend" DECIMAL(65,30),
    "conversions" INTEGER,
    "cpc" DECIMAL(65,30),
    "cpa" DECIMAL(65,30),
    "ctr" DECIMAL(65,30),
    "platformMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" "public"."ReportType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_integrations_userId_platform_key" ON "public"."oauth_integrations"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_userId_platform_platformCampaignId_key" ON "public"."campaigns"("userId", "platform", "platformCampaignId");

-- CreateIndex
CREATE INDEX "analytics_data_userId_platform_date_idx" ON "public"."analytics_data"("userId", "platform", "date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_data_userId_platform_date_campaignId_key" ON "public"."analytics_data"("userId", "platform", "date", "campaignId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oauth_integrations" ADD CONSTRAINT "oauth_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_data" ADD CONSTRAINT "analytics_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics_data" ADD CONSTRAINT "analytics_data_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
