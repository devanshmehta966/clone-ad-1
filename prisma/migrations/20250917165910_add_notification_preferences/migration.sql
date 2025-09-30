-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "budgetAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "performanceAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weeklyReports" BOOLEAN NOT NULL DEFAULT true;
