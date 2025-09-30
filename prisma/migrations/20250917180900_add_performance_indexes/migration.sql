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
CREATE INDEX "reports_userId_idx" ON "public"."reports"("userId");

-- CreateIndex
CREATE INDEX "reports_reportType_idx" ON "public"."reports"("reportType");

-- CreateIndex
CREATE INDEX "reports_startDate_idx" ON "public"."reports"("startDate");

-- CreateIndex
CREATE INDEX "reports_endDate_idx" ON "public"."reports"("endDate");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "public"."reports"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");
