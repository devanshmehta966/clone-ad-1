/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
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

-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropTable
DROP TABLE "public"."accounts";

-- DropTable
DROP TABLE "public"."profiles";

-- DropTable
DROP TABLE "public"."sessions";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."verification_tokens";

-- DropEnum
DROP TYPE "public"."Role";

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
CREATE INDEX "clients_userId_idx" ON "public"."clients"("userId");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "public"."clients"("status");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "public"."clients"("createdAt");

-- CreateIndex
CREATE INDEX "clients_lastLoginAt_idx" ON "public"."clients"("lastLoginAt");

-- CreateIndex
CREATE INDEX "oauth_integrations_userId_idx" ON "public"."oauth_integrations"("userId");

-- CreateIndex
CREATE INDEX "oauth_integrations_platform_idx" ON "public"."oauth_integrations"("platform");

-- CreateIndex
CREATE INDEX "oauth_integrations_isActive_idx" ON "public"."oauth_integrations"("isActive");

-- CreateIndex
CREATE INDEX "oauth_integrations_syncStatus_idx" ON "public"."oauth_integrations"("syncStatus");

-- CreateIndex
CREATE INDEX "oauth_integrations_tokenExpiresAt_idx" ON "public"."oauth_integrations"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "oauth_integrations_lastSyncAt_idx" ON "public"."oauth_integrations"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_integrations_userId_platform_key" ON "public"."oauth_integrations"("userId", "platform");

-- CreateIndex
CREATE INDEX "campaigns_userId_idx" ON "public"."campaigns"("userId");

-- CreateIndex
CREATE INDEX "campaigns_platform_idx" ON "public"."campaigns"("platform");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "public"."campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_startDate_idx" ON "public"."campaigns"("startDate");

-- CreateIndex
CREATE INDEX "campaigns_endDate_idx" ON "public"."campaigns"("endDate");

-- CreateIndex
CREATE INDEX "campaigns_createdAt_idx" ON "public"."campaigns"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_userId_platform_platformCampaignId_key" ON "public"."campaigns"("userId", "platform", "platformCampaignId");

-- CreateIndex
CREATE INDEX "analytics_data_userId_platform_date_idx" ON "public"."analytics_data"("userId", "platform", "date");

-- CreateIndex
CREATE INDEX "analytics_data_userId_date_idx" ON "public"."analytics_data"("userId", "date");

-- CreateIndex
CREATE INDEX "analytics_data_platform_date_idx" ON "public"."analytics_data"("platform", "date");

-- CreateIndex
CREATE INDEX "analytics_data_campaignId_idx" ON "public"."analytics_data"("campaignId");

-- CreateIndex
CREATE INDEX "analytics_data_date_idx" ON "public"."analytics_data"("date");

-- CreateIndex
CREATE INDEX "analytics_data_spend_idx" ON "public"."analytics_data"("spend");

-- CreateIndex
CREATE INDEX "analytics_data_conversions_idx" ON "public"."analytics_data"("conversions");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_data_userId_platform_date_campaignId_key" ON "public"."analytics_data"("userId", "platform", "date", "campaignId");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "public"."reports"("userId");

-- CreateIndex
CREATE INDEX "reports_reportType_idx" ON "public"."reports"("reportType");

-- CreateIndex
CREATE INDEX "reports_startDate_idx" ON "public"."reports"("startDate");

-- CreateIndex
CREATE INDEX "reports_endDate_idx" ON "public"."reports"("endDate");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "public"."reports"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."analytics_data" ADD CONSTRAINT "analytics_data_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
