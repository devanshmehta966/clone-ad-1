/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."analytics_data" DROP CONSTRAINT "analytics_data_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."campaigns" DROP CONSTRAINT "campaigns_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."clients" DROP CONSTRAINT "clients_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."oauth_integrations" DROP CONSTRAINT "oauth_integrations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_userId_fkey";

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
